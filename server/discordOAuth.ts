import crypto from 'crypto';
import express from 'express';
import { crosaimEventBus } from './crosaimEventBus';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email?: string | null;
  verified?: boolean;
  avatarUrl: string;
  authenticatedAt: string;
  role: string;
}

export interface OAuthSession {
  sessionId: string;
  user: DiscordUser;
  createdAt: number;
  expiresAt: number;
}

export class DiscordOAuthService {
  private states = new Map<string, { createdAt: number; redirectUri: string }>();
  private sessions = new Map<string, OAuthSession>();

  constructor() {
    // Periodically prune expired states and sessions every 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [state, data] of this.states.entries()) {
        if (now - data.createdAt > 15 * 60 * 1000) {
          this.states.delete(state);
        }
      }
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(sessionId);
        }
      }
    }, 10 * 60 * 1000);
  }

  public getClientId(): string {
    return (process.env.DISCORD_CLIENT_ID || '1547309949137453167').trim();
  }

  public getClientSecret(): string {
    return (process.env.DISCORD_CLIENT_SECRET || '').trim();
  }

  public getRedirectUri(req?: express.Request, clientOrigin?: string): string {
    // 1. Explicit client origin passed from window.location.origin
    if (clientOrigin && clientOrigin.startsWith('http') && !clientOrigin.includes('crosaim-centel.ai.studio')) {
      return `${clientOrigin.replace(/\/$/, '')}/api/auth/discord/callback`;
    }

    // 2. Explicit environment variable if valid and not the dummy domain
    if (
      process.env.DISCORD_REDIRECT_URI &&
      process.env.DISCORD_REDIRECT_URI.startsWith('http') &&
      !process.env.DISCORD_REDIRECT_URI.includes('crosaim-centel.ai.studio')
    ) {
      return process.env.DISCORD_REDIRECT_URI.trim();
    }

    // 3. Extract origin from request headers (behind reverse proxy)
    if (req) {
      const explicitOrigin = (req.query?.origin as string) || (req.headers?.origin as string);
      if (explicitOrigin && explicitOrigin.startsWith('http') && !explicitOrigin.includes('crosaim-centel.ai.studio')) {
        return `${explicitOrigin.replace(/\/$/, '')}/api/auth/discord/callback`;
      }

      const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || req.headers.host;
      if (host && !host.includes('crosaim-centel.ai.studio')) {
        const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
        return `${proto}://${host}/api/auth/discord/callback`;
      }
    }

    // 4. Injected APP_URL from AI Studio environment
    if (process.env.APP_URL && process.env.APP_URL.startsWith('http') && !process.env.APP_URL.includes('crosaim-centel.ai.studio')) {
      return `${process.env.APP_URL.replace(/\/$/, '')}/api/auth/discord/callback`;
    }

    // 5. Fallback to Cloud Run Development App URL
    return 'https://ais-dev-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback';
  }

  /**
   * Generates a secure CSRF state and registers it
   */
  public generateState(redirectUri: string): string {
    const state = crypto.randomBytes(32).toString('hex');
    this.states.set(state, { createdAt: Date.now(), redirectUri });
    return state;
  }

  /**
   * Validates and consumes a CSRF state token
   */
  public consumeState(state: string): { valid: boolean; redirectUri?: string } {
    if (!state) return { valid: false };
    const entry = this.states.get(state);
    if (!entry) return { valid: false };

    // Check expiration (15 minutes)
    const isExpired = Date.now() - entry.createdAt > 15 * 60 * 1000;
    this.states.delete(state); // Single-use consumption prevents replay attacks

    if (isExpired) {
      return { valid: false };
    }

    return { valid: true, redirectUri: entry.redirectUri };
  }

  /**
   * Builds the Discord OAuth2 authorization URL
   */
  public buildAuthorizationUrl(redirectUri: string, state: string): string {
    const clientId = this.getClientId();
    const scopes = ['identify', 'email'].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state: state,
      prompt: 'consent'
    });

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for Discord access token (SERVER-SIDE ONLY)
   */
  public async exchangeCodeForToken(code: string, redirectUri: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  }> {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    if (!clientSecret) {
      throw new Error('DISCORD_CLIENT_SECRET no está configurado en las variables de entorno / Secrets.');
    }

    const bodyParams = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    });

    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyParams.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Discord OAuth Error]', data);
      throw new Error(data.error_description || data.error || `HTTP ${response.status} en intercambio de token`);
    }

    return data;
  }

  /**
   * Fetches basic Discord identity from /users/@me (SERVER-SIDE ONLY)
   */
  public async fetchUserProfile(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `No se pudo obtener el perfil de Discord (HTTP ${response.status})`);
    }

    const rawUser = await response.json();

    const avatarUrl = rawUser.avatar
      ? `https://cdn.discordapp.com/avatars/${rawUser.id}/${rawUser.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${parseInt(rawUser.discriminator || '0', 10) % 5}.png`;

    return {
      id: rawUser.id,
      username: rawUser.username,
      discriminator: rawUser.discriminator || '0',
      global_name: rawUser.global_name || rawUser.username,
      avatar: rawUser.avatar,
      email: rawUser.email || null,
      verified: !!rawUser.verified,
      avatarUrl,
      authenticatedAt: new Date().toISOString(),
      role: 'Staff / Operador CROSAIM'
    };
  }

  /**
   * Creates a secure server session
   */
  public createSession(user: DiscordUser): string {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    this.sessions.set(sessionId, {
      sessionId,
      user,
      createdAt: now,
      expiresAt
    });

    // Dispatch event to CROSAIM Event Bus
    crosaimEventBus.dispatch({
      eventType: 'DISCORD_ROLE_ASSIGNED',
      source: 'DISCORD_BOT',
      target: 'CONTROL_CENTER',
      user: user.username,
      player: user.global_name || user.username,
      previousStage: 'UNAUTHENTICATED',
      newStage: 'AUTHENTICATED',
      payload: {
        discordId: user.id,
        username: user.username,
        email: user.email ? `${user.email.substring(0, 3)}***@***` : 'N/A',
        authMethod: 'DISCORD_OAUTH2_CALLBACK',
        authenticatedAt: user.authenticatedAt
      }
    }).catch(err => console.error('[EventBus OAuth Notice Error]', err));

    return sessionId;
  }

  public getSession(sessionId: string): OAuthSession | null {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  public destroySession(sessionId: string): void {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Generates the popup callback HTML with cross-origin postMessage
   */
  public renderCallbackSuccessHtml(user: DiscordUser): string {
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      global_name: user.global_name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      authenticatedAt: user.authenticatedAt
    };

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CROSAIM · Autenticación Discord Exitosa</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07090e;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background-color: #0f1422;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .avatar {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      border: 3px solid #5865f2;
      margin: 0 auto 1.25rem;
      display: block;
      box-shadow: 0 0 20px rgba(88, 101, 242, 0.4);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(88, 101, 242, 0.15);
      border: 1px solid rgba(88, 101, 242, 0.3);
      color: #818cf8;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
    }
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.35rem;
      color: #ffffff;
      font-weight: 700;
    }
    p {
      margin: 0 0 1.5rem;
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.5;
    }
    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #34d399;
      font-family: monospace;
    }
    .pulse {
      width: 8px;
      height: 8px;
      background-color: #34d399;
      border-radius: 50%;
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
  </style>
</head>
<body>
  <div class="card">
    <img class="avatar" src="${user.avatarUrl}" alt="${user.username}" />
    <span class="badge">CROSAIM CONTROL CENTER // OAUTH2</span>
    <h2>¡Bienvenido, ${user.global_name || user.username}!</h2>
    <p>Tu identidad de Discord ha sido validada e integrada con el núcleo operativo de <b>CROSAIM</b>.</p>
    <div class="status">
      <span class="pulse"></span>
      <span>Sincronizando sesión y cerrando ventana...</span>
    </div>
  </div>

  <script>
    (function() {
      var payload = {
        type: 'OAUTH_AUTH_SUCCESS',
        provider: 'discord',
        user: ${JSON.stringify(sanitizedUser)}
      };

      // 1. Send postMessage to opener if opened in a popup
      if (window.opener) {
        try {
          window.opener.postMessage(payload, '*');
        } catch (e) {
          console.warn('postMessage error:', e);
        }
        setTimeout(function() {
          window.close();
        }, 1200);
      } else {
        // Fallback for full-window redirect navigation
        setTimeout(function() {
          window.location.href = '/';
        }, 1500);
      }
    })();
  </script>
</body>
</html>`;
  }

  /**
   * Generates the popup callback error HTML
   */
  public renderCallbackErrorHtml(errorMessage: string, details?: string): string {
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CROSAIM · Error en Autenticación Discord</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07090e;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background-color: #0f1422;
      border: 1px solid #7f1d1d;
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 440px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .icon {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      border: 2px solid #ef4444;
      color: #ef4444;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      color: #fca5a5;
    }
    p {
      margin: 0 0 1rem;
      font-size: 0.875rem;
      color: #94a3b8;
      line-height: 1.5;
    }
    .details {
      background: #181c2a;
      border: 1px solid #334155;
      padding: 0.75rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.75rem;
      color: #cbd5e1;
      word-break: break-all;
      margin-bottom: 1.5rem;
      text-align: left;
    }
    button {
      background: #334155;
      border: none;
      color: #fff;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
    }
    button:hover {
      background: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✕</div>
    <h2>Error de Autenticación</h2>
    <p>${errorMessage}</p>
    ${details ? `<div class="details">${details}</div>` : ''}
    <button onclick="window.close()">Cerrar ventana</button>
  </div>

  <script>
    (function() {
      var payload = {
        type: 'OAUTH_AUTH_ERROR',
        provider: 'discord',
        error: ${JSON.stringify(errorMessage)}
      };
      if (window.opener) {
        try {
          window.opener.postMessage(payload, '*');
        } catch (e) {}
      }
    })();
  </script>
</body>
</html>`;
  }
}

export const discordOAuthService = new DiscordOAuthService();
