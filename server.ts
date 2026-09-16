import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { discordService } from './server/discordService';
import { crosaimEventBus } from './server/crosaimEventBus';
import { discordOAuthService } from './server/discordOAuth';
import { supabaseAdminService } from './server/supabaseService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Healthcheck endpoint
  app.get('/api/health', async (req, res) => {
    const botStatus = await discordService.getBotStatus();
    const supabaseStatus = supabaseAdminService.getStatus();
    res.json({
      status: 'healthy',
      system: 'CROSAIM ECOSYSTEM CORE',
      version: '2.4.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      discordBot: {
        connected: botStatus.success,
        botInfo: botStatus.bot || null,
        error: botStatus.error || null
      },
      discordOAuth: {
        configured: !!process.env.DISCORD_CLIENT_SECRET,
        clientId: discordOAuthService.getClientId(),
        redirectUri: discordOAuthService.getRedirectUri(req)
      },
      supabase: {
        configured: supabaseStatus.isConfigured,
        hasUrl: supabaseStatus.hasUrl,
        hasServiceRoleKey: supabaseStatus.hasServiceRoleKey,
        url: supabaseStatus.supabaseUrl
      }
    });
  });

  // Supabase Data Tier Status & Diagnostics (Never exposes service role key)
  app.get('/api/supabase/status', async (req, res) => {
    const status = supabaseAdminService.getStatus();
    res.json(status);
  });

  app.get('/api/supabase/test', async (req, res) => {
    const testResult = await supabaseAdminService.testConnection();
    res.json(testResult);
  });

  app.get('/api/supabase/sql', (req, res) => {
    res.type('text/plain').send(supabaseAdminService.getSqlMigrationScript());
  });

  // Discord Webhook Details (Real Server & Channel Information)
  app.get('/api/discord/webhook', async (req, res) => {
    const info = await discordService.getWebhookInfo();
    res.json(info);
  });

  // Real CROSAIM Roster Endpoints (Persisted in Supabase & Local Store)
  app.get('/api/crosaim/roster', async (req, res) => {
    const roster = await supabaseAdminService.getRoster();
    res.json({
      success: true,
      roster,
      count: roster.length
    });
  });

  app.post('/api/crosaim/roster', async (req, res) => {
    try {
      const player = req.body;
      if (!player.name || !player.role) {
        return res.status(400).json({ success: false, error: 'name y role son requeridos' });
      }
      await supabaseAdminService.saveRosterMember(player);
      res.json({ success: true, player });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Real CROSAIM Candidates Endpoints (Persisted in Supabase & Local Store)
  app.get('/api/crosaim/candidates', async (req, res) => {
    const candidates = await supabaseAdminService.getCandidates();
    res.json({
      success: true,
      candidates,
      count: candidates.length
    });
  });

  app.post('/api/crosaim/candidates', async (req, res) => {
    try {
      const candidate = req.body;
      if (!candidate.riotId || !candidate.discordTag) {
        return res.status(400).json({ success: false, error: 'riotId y discordTag son requeridos' });
      }
      await supabaseAdminService.saveCandidate(candidate);

      // Also trigger event to Event Bus & Discord
      const playerName = `${candidate.riotId}#${candidate.tagLine || 'LAN'}`;
      const eventRes = await crosaimEventBus.dispatch({
        eventType: 'PLAYER_APPLICATION_CREATED',
        source: 'WEB_PORTAL',
        target: 'ALL',
        user: 'Aspirante Web',
        player: playerName,
        previousStage: 'NONE',
        newStage: candidate.stage || 'APPLY',
        payload: {
          applicant: playerName,
          riotId: candidate.riotId,
          tagLine: candidate.tagLine,
          discordTag: candidate.discordTag,
          role: candidate.role,
          rank: candidate.rank,
          trackingCode: candidate.trackingCode
        }
      });

      res.json({ success: true, candidate, event: eventRes });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/crosaim/candidates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const candidate = { id, ...updates };
      await supabaseAdminService.saveCandidate(candidate);
      res.json({ success: true, candidate });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Real System Stats (Real Counts, Zero Fictitious Numbers)
  app.get('/api/crosaim/stats', async (req, res) => {
    const [roster, candidates, webhookStatus, supabaseStatus] = await Promise.all([
      supabaseAdminService.getRoster(),
      supabaseAdminService.getCandidates(),
      discordService.getWebhookInfo(),
      Promise.resolve(supabaseAdminService.getStatus())
    ]);

    const eventsHistory = crosaimEventBus.getHistory();

    res.json({
      success: true,
      stats: {
        totalRosterMembers: roster.length,
        totalCandidates: candidates.length,
        candidatesByStage: {
          apply: candidates.filter(c => c.stage === 'APPLY').length,
          review: candidates.filter(c => c.stage === 'REVIEW').length,
          interview: candidates.filter(c => c.stage === 'INTERVIEW').length,
          tryout: candidates.filter(c => c.stage === 'TRYOUT').length,
          roster: candidates.filter(c => c.stage === 'ROSTER').length,
          rejected: candidates.filter(c => c.status === 'rejected').length
        },
        totalSignalsDispatched: eventsHistory.length,
        discordWebhookActive: webhookStatus.success,
        discordChannel: webhookStatus.info?.channelId || null,
        discordGuild: webhookStatus.info?.guildId || null,
        supabaseConnected: supabaseStatus.isConfigured
      }
    });
  });

  // Discord OAuth2 Public Config (Never exposes client_secret)
  app.get('/api/auth/discord/config', (req, res) => {
    const origin = (req.query.origin as string) || '';
    const redirectUri = discordOAuthService.getRedirectUri(req, origin);
    const devRedirectUri = 'https://ais-dev-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback';
    const sharedRedirectUri = 'https://ais-pre-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback';

    res.json({
      clientId: discordOAuthService.getClientId(),
      redirectUri,
      devRedirectUri,
      sharedRedirectUri,
      discordPortalUrl: `https://discord.com/developers/applications/${discordOAuthService.getClientId()}/oauth2`,
      hasSecretConfigured: !!process.env.DISCORD_CLIENT_SECRET,
      loginUrl: `/api/auth/discord/login`
    });
  });

  // Discord OAuth2: Generate Authorization URL & CSRF State (For Popup & UI)
  app.get('/api/auth/discord/url', (req, res) => {
    try {
      const origin = (req.query.origin as string) || '';
      const redirectUri = discordOAuthService.getRedirectUri(req, origin);
      const state = discordOAuthService.generateState(redirectUri);

      // Set state cookie with SameSite: 'none' and Secure: true for iframe cross-origin safety
      res.cookie('crosaim_oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      const authUrl = discordOAuthService.buildAuthorizationUrl(redirectUri, state);

      res.json({
        success: true,
        url: authUrl,
        state,
        redirectUri
      });
    } catch (err: any) {
      console.error('[OAuth URL Error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Discord OAuth2: Direct Login Redirect (Non-popup / direct tab navigation)
  app.get('/api/auth/discord/login', (req, res) => {
    try {
      const origin = (req.query.origin as string) || '';
      const redirectUri = discordOAuthService.getRedirectUri(req, origin);
      const state = discordOAuthService.generateState(redirectUri);

      res.cookie('crosaim_oauth_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000
      });

      const authUrl = discordOAuthService.buildAuthorizationUrl(redirectUri, state);
      res.redirect(authUrl);
    } catch (err: any) {
      console.error('[OAuth Login Redirect Error]', err);
      res.status(500).send(`Error iniciando Discord OAuth: ${err.message}`);
    }
  });

  // Discord Demo/Staff Instant Auth (Allows instant testing of operator features without portal redirect block)
  app.post('/api/auth/discord/demo-login', (req, res) => {
    try {
      const demoUser = {
        id: '1547309949137453167',
        username: 'CROSAIM Staff Operador',
        discriminator: '0001',
        global_name: 'CROSAIM Head Coach',
        avatar: null,
        email: 'staff@crosaim.gg',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80',
        authenticatedAt: new Date().toISOString(),
        role: 'HEAD_OPERATOR'
      };

      const sessionId = discordOAuthService.createSession(demoUser);

      res.cookie('crosaim_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        user: demoUser
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Discord OAuth2: Callback Endpoint (Handles code exchange, CSRF validation, user identity)
  // Registering both with and without trailing slash for proxy compatibility
  const handleDiscordCallback = async (req: express.Request, res: express.Response) => {
    try {
      const { code, state, error, error_description } = req.query as {
        code?: string;
        state?: string;
        error?: string;
        error_description?: string;
      };

      // 1. Handle user cancellation or Discord error
      if (error) {
        console.warn('[Discord OAuth Callback Error from Discord]', { error, error_description });
        const html = discordOAuthService.renderCallbackErrorHtml(
          `Discord canceló la autorización: ${error}`,
          error_description || 'El usuario rechazó la solicitud o el acceso fue denegado.'
        );
        return res.status(400).send(html);
      }

      if (!code) {
        const html = discordOAuthService.renderCallbackErrorHtml(
          'Código de autorización faltante en la petición de retorno.'
        );
        return res.status(400).send(html);
      }

      // 2. Validate CSRF state
      const stateValidation = discordOAuthService.consumeState(state || '');
      const cookieState = req.cookies['crosaim_oauth_state'];
      const isStateValid = stateValidation.valid || (cookieState && cookieState === state);

      if (!isStateValid) {
        console.warn('[Discord OAuth CSRF Warning]', { state, cookieState });
        const html = discordOAuthService.renderCallbackErrorHtml(
          'Error de validación CSRF (State inválido o expirado).',
          'Por motivos de seguridad, los intentos de autenticación deben completarse en menos de 15 minutos.'
        );
        return res.status(403).send(html);
      }

      // Clear the temporary state cookie
      res.clearCookie('crosaim_oauth_state', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      });

      // 3. Resolve redirect URI (must match the exact redirect_uri sent during authorize)
      const redirectUri = stateValidation.redirectUri || discordOAuthService.getRedirectUri(req);

      // 4. Exchange code for tokens (SERVER-SIDE ONLY - tokens never exposed to client)
      console.log(`[CROSAIM OAuth] Intercambiando code con Discord para redirect_uri: ${redirectUri}`);
      const tokenData = await discordOAuthService.exchangeCodeForToken(code, redirectUri);

      // 5. Fetch basic Discord user identity from /users/@me
      const user = await discordOAuthService.fetchUserProfile(tokenData.access_token);
      console.log(`[CROSAIM OAuth] Identidad verificada con éxito: ${user.username} (${user.id})`);

      // 6. Create secure session on server
      const sessionId = discordOAuthService.createSession(user);

      // 7. Store session in HTTP-only, secure, SameSite=none cookie (for iframe support)
      res.cookie('crosaim_session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // 8. Render popup-friendly HTML with cross-origin postMessage
      const html = discordOAuthService.renderCallbackSuccessHtml(user);
      return res.status(200).send(html);
    } catch (err: any) {
      console.error('[Discord OAuth Callback Exception]', err);
      const html = discordOAuthService.renderCallbackErrorHtml(
        'Fallo durante el procesamiento del token de Discord',
        err.message || 'Error desconocido'
      );
      return res.status(500).send(html);
    }
  };

  app.get('/api/auth/discord/callback', handleDiscordCallback);
  app.get('/api/auth/discord/callback/', handleDiscordCallback);

  // Discord OAuth2: Check Authenticated User Session
  app.get('/api/auth/discord/me', (req, res) => {
    const sessionCookie = req.cookies['crosaim_session'];
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const sessionId = sessionCookie || bearerToken;
    const session = discordOAuthService.getSession(sessionId);

    if (!session) {
      return res.json({
        authenticated: false,
        user: null
      });
    }

    res.json({
      authenticated: true,
      user: session.user
    });
  });

  // Discord OAuth2: Logout
  app.post('/api/auth/discord/logout', (req, res) => {
    const sessionCookie = req.cookies['crosaim_session'];
    if (sessionCookie) {
      discordOAuthService.destroySession(sessionCookie);
    }

    res.clearCookie('crosaim_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.json({ success: true, message: 'Sesión finalizada con éxito' });
  });

  // Discord Bot Status
  app.get('/api/discord/status', async (req, res) => {
    const status = await discordService.getBotStatus();
    const guildsRes = await discordService.getBotGuilds();
    res.json({
      ...status,
      applicationId: discordService.getApplicationId(),
      inviteUrl: discordService.getInviteUrl(),
      guilds: guildsRes.guilds || []
    });
  });

  // Get Discord Guilds
  app.get('/api/discord/guilds', async (req, res) => {
    const guilds = await discordService.getBotGuilds();
    res.json(guilds);
  });

  // Get Discord Channels for a Guild
  app.get('/api/discord/guilds/:guildId/channels', async (req, res) => {
    const { guildId } = req.params;
    const channels = await discordService.getGuildChannels(guildId);
    res.json(channels);
  });

  // Direct Send Embed Endpoint
  app.post('/api/discord/send-embed', async (req, res) => {
    const { channelId, webhookUrl, content, embeds } = req.body;
    if (!embeds || !Array.isArray(embeds)) {
      return res.status(400).json({ success: false, error: 'Array de embeds requerido' });
    }

    const result = await discordService.sendMessage({
      channelId,
      webhookUrl,
      content,
      embeds
    });

    res.json(result);
  });

  // CROSAIM Core Events Bus - Centralized Signal Pipeline
  // Flow: CROSAIM CORE -> EVENT / SIGNAL -> PROCESSOR -> DISCORD ADAPTER -> DISCORD
  app.get('/api/crosaim/events', (req, res) => {
    res.json({
      success: true,
      events: crosaimEventBus.getHistory()
    });
  });

  app.post('/api/crosaim/events', async (req, res) => {
    try {
      const {
        eventType,
        source,
        target,
        user,
        player,
        previousStage,
        newStage,
        payload
      } = req.body;

      if (!eventType || !player) {
        return res.status(400).json({
          success: false,
          error: 'Campos requeridos: eventType y player son obligatorios'
        });
      }

      const dispatchedEvent = await crosaimEventBus.dispatch({
        eventType,
        source: source || 'CROSAIM_CORE',
        target: target || 'DISCORD',
        user: user || 'Staff Web',
        player,
        previousStage,
        newStage,
        payload: payload || {}
      });

      res.json({
        success: true,
        event: dispatchedEvent
      });
    } catch (err: any) {
      console.error('Error procesando evento CROSAIM:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Error interno en el bus de señales'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CROSAIM CORE] Servidor activo en http://0.0.0.0:${PORT}`);
    console.log(`[CROSAIM DISCORD] Bot Application ID: ${discordService.getApplicationId()}`);
  });
}

startServer().catch((err) => {
  console.error('Fallo crítico al iniciar servidor CROSAIM:', err);
});
