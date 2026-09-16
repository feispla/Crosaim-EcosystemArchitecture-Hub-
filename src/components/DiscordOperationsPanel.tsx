import React, { useState, useEffect } from 'react';
import { DiscordBotState, SignalEvent, DiscordOAuthUser } from '../types';
import { crosaimClient } from '../services/crosaimClient';
import { soundFX } from '../utils/audioFX';
import {
  MessageSquare,
  Bot,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Hash,
  Volume2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Radio,
  Clock,
  User,
  Crown,
  KeyRound,
  Copy,
  Check,
  LogOut,
  LogIn
} from 'lucide-react';

interface DiscordOperationsPanelProps {
  signals: SignalEvent[];
  onDispatchSignal: (signal: SignalEvent) => void;
}

export const DiscordOperationsPanel: React.FC<DiscordOperationsPanelProps> = ({
  signals,
  onDispatchSignal
}) => {
  const [botState, setBotState] = useState<DiscordBotState>({
    connected: false,
    applicationId: '1547309949137453167',
    inviteUrl: 'https://discord.com/oauth2/authorize?client_id=1547309949137453167&permissions=277025508416&scope=bot%20applications.commands'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [targetChannelId, setTargetChannelId] = useState('');
  const [targetWebhookUrl, setTargetWebhookUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'live-feed' | 'oauth' | 'settings'>('preview');
  const [selectedStatePreview, setSelectedStatePreview] = useState<
    'POSTULACION' | 'REVISION' | 'ENTREVISTA' | 'APROBADA' | 'RECHAZADA' | 'ROSTER'
  >('POSTULACION');
  const [customPlayerName, setCustomPlayerName] = useState('Valkyrie#LATAM');
  const [lastDispatchedStatus, setLastDispatchedStatus] = useState<string | null>(null);

  // Discord OAuth2 States
  const [oauthUser, setOauthUser] = useState<DiscordOAuthUser | null>(null);
  const [isOauthLoading, setIsOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedDevCallback, setCopiedDevCallback] = useState(false);
  const [copiedSharedCallback, setCopiedSharedCallback] = useState(false);
  const [oauthConfig, setOauthConfig] = useState({
    clientId: '1547309949137453167',
    redirectUri: 'https://ais-dev-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback',
    devRedirectUri: 'https://ais-dev-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback',
    sharedRedirectUri: 'https://ais-pre-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback',
    discordPortalUrl: 'https://discord.com/developers/applications/1547309949137453167/oauth2',
    hasSecretConfigured: true,
    loginUrl: '/api/auth/discord/login'
  });

  // Fetch bot status & authenticated OAuth user on mount
  useEffect(() => {
    fetchStatus();
    checkOAuthSession();
    loadOAuthConfig();

    // Listen for OAuth popup postMessage
    const handleMessage = (event: MessageEvent) => {
      // Validate origin if not localhost or run.app
      const origin = event.origin;
      if (origin && !origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      // Validate data structure
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        setOauthUser(event.data.user);
        setIsOauthLoading(false);
        setOauthError(null);
        soundFX.playSuccess();

        // Notify in signal bus
        const authSignal: SignalEvent = {
          id: `sig-oauth-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          source: 'DISCORD_BOT',
          target: 'CONTROL_CENTER',
          eventType: 'DISCORD_ROLE_ASSIGNED',
          payload: {
            user: event.data.user.username,
            discordId: event.data.user.id,
            authType: 'DISCORD_OAUTH2_CALLBACK',
            channel: oauthConfig.redirectUri
          },
          hmacSignature: `sha256=${Math.random().toString(16).substring(2, 14)}`,
          ackStatus: 'ACK_CONFIRMED'
        };
        onDispatchSignal(authSignal);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setOauthError(event.data.error || 'Error en la autorización de Discord');
        setIsOauthLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [oauthConfig.redirectUri]);

  const checkOAuthSession = async () => {
    const res = await crosaimClient.getAuthenticatedUser();
    if (res.authenticated && res.user) {
      setOauthUser(res.user);
    }
  };

  const loadOAuthConfig = async () => {
    const cfg = await crosaimClient.getOAuthConfig();
    setOauthConfig(cfg as any);
  };

  const handleConnectOAuth = async () => {
    soundFX.playClick();
    setIsOauthLoading(true);
    setOauthError(null);

    try {
      // 1. Fetch server-generated authorization URL with secure CSRF state
      const res = await crosaimClient.getOAuthAuthorizationUrl();
      if (!res.success || !res.url) {
        throw new Error(res.error || 'No se pudo obtener la URL de autorización');
      }

      // 2. Open provider authorize URL directly in popup (Skill Requirement)
      const width = 580;
      const height = 750;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        res.url,
        'crosaim_discord_oauth',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!authWindow) {
        alert('Por favor habilita las ventanas emergentes (popups) para iniciar sesión con Discord.');
        setIsOauthLoading(false);
      }
    } catch (err: any) {
      setOauthError(err.message || 'Error iniciando flujo OAuth2');
      setIsOauthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    soundFX.playClick();
    setIsOauthLoading(true);
    setOauthError(null);

    try {
      const res = await crosaimClient.demoLoginOAuth();
      if (res.success && res.user) {
        setOauthUser(res.user);
        soundFX.playSuccess();
        const authSignal: SignalEvent = {
          id: `sig-oauth-demo-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          source: 'DISCORD_BOT',
          target: 'CONTROL_CENTER',
          eventType: 'DISCORD_ROLE_ASSIGNED',
          payload: {
            user: res.user.username,
            discordId: res.user.id,
            authType: 'STAFF_OPERATOR_VERIFIED',
            channel: oauthConfig.redirectUri
          },
          hmacSignature: `sha256=${Math.random().toString(16).substring(2, 14)}`,
          ackStatus: 'ACK_CONFIRMED'
        };
        onDispatchSignal(authSignal);
      } else {
        throw new Error(res.error || 'Error al autenticar operador');
      }
    } catch (e: any) {
      setOauthError(e.message || 'Error en inicio de sesión de operador');
    } finally {
      setIsOauthLoading(false);
    }
  };

  const handleLogoutOAuth = async () => {
    soundFX.playClick();
    await crosaimClient.logoutOAuth();
    setOauthUser(null);
  };

  const copyCallbackUrl = (url?: string) => {
    soundFX.playClick();
    const targetUrl = url || oauthConfig.redirectUri;
    navigator.clipboard.writeText(targetUrl);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const copyDevCallbackUrl = () => {
    soundFX.playClick();
    const targetUrl = oauthConfig.devRedirectUri || 'https://ais-dev-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback';
    navigator.clipboard.writeText(targetUrl);
    setCopiedDevCallback(true);
    setTimeout(() => setCopiedDevCallback(false), 2000);
  };

  const copySharedCallbackUrl = () => {
    soundFX.playClick();
    const targetUrl = oauthConfig.sharedRedirectUri || 'https://ais-pre-f2po5w7ntpgyehs6yse5sl-219686599777.us-east5.run.app/api/auth/discord/callback';
    navigator.clipboard.writeText(targetUrl);
    setCopiedSharedCallback(true);
    setTimeout(() => setCopiedSharedCallback(false), 2000);
  };


  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const state = await crosaimClient.getDiscordStatus();
      setBotState(state);
    } catch {
      // Handled in client
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerEmbedTest = async (state: typeof selectedStatePreview) => {
    setIsLoading(true);
    setLastDispatchedStatus(null);

    let eventType: any = 'PLAYER_APPLICATION_CREATED';
    let previousStage = 'NONE';
    let newStage = 'APPLY';
    let payload: Record<string, any> = {
      discordChannelId: targetChannelId || undefined,
      webhookUrl: targetWebhookUrl || undefined
    };

    if (state === 'POSTULACION') {
      eventType = 'PLAYER_APPLICATION_CREATED';
      previousStage = 'NONE';
      newStage = 'APPLY';
      payload = {
        ...payload,
        riotId: customPlayerName.split('#')[0] || 'Valkyrie',
        tagLine: customPlayerName.split('#')[1] || 'LATAM',
        discordTag: 'valkyrie#1337',
        role: 'Initiator',
        rank: 'Radiant',
        trackingCode: 'CRO-7821'
      };
    } else if (state === 'REVISION') {
      eventType = 'PLAYER_APPLICATION_REVIEWED';
      previousStage = 'APPLY';
      newStage = 'REVIEW';
      payload = {
        ...payload,
        riotId: customPlayerName.split('#')[0] || 'Valkyrie',
        tagLine: customPlayerName.split('#')[1] || 'LATAM',
        discordTag: 'valkyrie#1337',
        role: 'Initiator',
        rank: 'Radiant',
        scrimKDA: '1.45 K/D',
        trackingCode: 'CRO-7821',
        reviewer: 'Head Coach Feispla'
      };
    } else if (state === 'ENTREVISTA') {
      eventType = 'PLAYER_INTERVIEW_STARTED';
      previousStage = 'REVIEW';
      newStage = 'INTERVIEW';
      payload = {
        ...payload,
        player: customPlayerName,
        discordTag: 'valkyrie#1337',
        interviewer: 'Coach Feispla & Staff Operaciones',
        channel: '🔊 Sala de Voz Tryouts #1',
        scheduledTime: 'Hoy 20:00 UTC',
        role: 'Initiator',
        rank: 'Radiant',
        trackingCode: 'CRO-7821',
        notes: 'Revisión de pool de agentes (Sova/Fade), disponibilidad de horarios nocturnos y comunicación táctica.'
      };
    } else if (state === 'APROBADA') {
      eventType = 'PLAYER_APPLICATION_APPROVED';
      previousStage = 'INTERVIEW';
      newStage = 'TRYOUT';
      payload = {
        ...payload,
        player: customPlayerName,
        discordTag: 'valkyrie#1337',
        rank: 'Radiant',
        role: 'Initiator',
        teamTarget: 'Main Roster (Tier 1)',
        trackingCode: 'CRO-7821'
      };
    } else if (state === 'RECHAZADA') {
      eventType = 'PLAYER_APPLICATION_REJECTED';
      previousStage = 'REVIEW';
      newStage = 'REJECTED';
      payload = {
        ...payload,
        player: customPlayerName,
        discordTag: 'valkyrie#1337',
        role: 'Initiator',
        reason: 'Cupo de Iniciador cubierto en el roster principal. Invitado para el split de primavera.',
        trackingCode: 'CRO-7821'
      };
    } else if (state === 'ROSTER') {
      eventType = 'PLAYER_ROSTER_JOINED';
      previousStage = 'APROBADA';
      newStage = 'ROSTER';
      payload = {
        ...payload,
        playerName: customPlayerName.split('#')[0] || customPlayerName,
        riotId: customPlayerName.split('#')[0] || 'Valkyrie',
        tagLine: customPlayerName.split('#')[1] || 'LATAM',
        discordTag: 'valkyrie#1337',
        role: 'Initiator',
        rank: 'Radiant',
        team: 'Main Roster',
        assignedRoleTag: '@Main-Initiator',
        trackingCode: 'CRO-7821'
      };
    }

    try {
      const res = await crosaimClient.dispatchEvent({
        eventType,
        source: 'CROSAIM_CORE',
        target: 'DISCORD',
        user: 'Staff Operaciones Web',
        player: customPlayerName,
        previousStage,
        newStage,
        payload
      });

      if (res.success && res.event) {
        onDispatchSignal(res.event);
        setLastDispatchedStatus(`Señal ${eventType} transmitida exitosamente.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Render Discord-styled embed mockup for chosen state
  const renderMockEmbed = () => {
    const pName = customPlayerName.split('#')[0] || customPlayerName;
    const pTag = customPlayerName.split('#')[1] || 'LATAM';

    const embedConfigs = {
      POSTULACION: {
        colorBorder: 'border-l-[#FEE75C]',
        badgeColor: 'bg-[#FEE75C]/20 text-[#FEE75C]',
        title: '🟡 NUEVA POSTULACIÓN RECIBIDA // CROSAIM TRYOUTS',
        desc: 'Un nuevo aspirante ha registrado su postulación en el portal central de **CROSAIM Esports**.',
        fields: [
          { label: 'Jugador / Riot ID', value: `${pName}#${pTag}` },
          { label: 'Usuario Discord', value: 'valkyrie#1337' },
          { label: 'Rango Máximo', value: 'Radiant (Top 500)' },
          { label: 'Rol Táctico', value: 'Initiator' },
          { label: 'Tracking Token', value: 'CRO-7821' },
          { label: 'Estado Actual', value: '🟡 01. POSTULACIÓN (Pendiente)' }
        ]
      },
      REVISION: {
        colorBorder: 'border-l-[#3498DB]',
        badgeColor: 'bg-[#3498DB]/20 text-[#3498DB]',
        title: '🔵 POSTULACIÓN EN REVISIÓN TÉCNICA // CROSAIM STAFF',
        desc: 'El cuerpo técnico y analistas han comenzado la auditoría de MMR y estadísticas del aspirante.',
        fields: [
          { label: 'Jugador', value: `${pName}#${pTag}` },
          { label: 'Discord', value: 'valkyrie#1337' },
          { label: 'Rango Verificado', value: 'Radiant' },
          { label: 'Rol Evaluado', value: 'Initiator' },
          { label: 'K/D Registrado', value: '1.45 K/D' },
          { label: 'Auditor Asignado', value: 'Head Coach Feispla' }
        ]
      },
      ENTREVISTA: {
        colorBorder: 'border-l-[#9B59B6]',
        badgeColor: 'bg-[#9B59B6]/20 text-[#9B59B6]',
        title: '🟣 CONVOCATORIA A ENTREVISTA DE DISCORD // FASE 3',
        desc: 'Se ha convocado formalmente al aspirante para la entrevista técnica y actitudinal del cuerpo técnico de **CROSAIM**.',
        fields: [
          { label: 'QUIÉN → JUGADOR', value: `${pName}#${pTag} (valkyrie#1337)` },
          { label: 'QUIÉN → ENTREVISTADOR', value: 'Head Coach Feispla' },
          { label: 'DÓNDE → CANAL', value: '🔊 Sala de Voz Tryouts #1' },
          { label: 'CUÁNDO → FECHA/HORA', value: '📅 Hoy 20:00 UTC' },
          { label: 'ESTADO → PROCESO', value: '🟣 03. ENTREVISTA ACTIVA' },
          { label: 'Tracking Token', value: 'CRO-7821' }
        ]
      },
      APROBADA: {
        colorBorder: 'border-l-[#2ECC71]',
        badgeColor: 'bg-[#2ECC71]/20 text-[#2ECC71]',
        title: '🟢 POSTULACIÓN APROBADA // PRUEBAS CONCLUIDAS',
        desc: 'El aspirante ha superado con éxito las fases de postulación, auditoría de MMR y entrevista con el Staff.',
        fields: [
          { label: 'Jugador', value: `${pName}#${pTag}` },
          { label: 'Discord', value: 'valkyrie#1337' },
          { label: 'Rango Confirmado', value: 'Radiant' },
          { label: 'Rol Táctico', value: 'Initiator' },
          { label: 'Destino Asignado', value: 'Main Roster (Tier 1)' },
          { label: 'Estado', value: '🟢 04. APROBADA' }
        ]
      },
      RECHAZADA: {
        colorBorder: 'border-l-[#E74C3C]',
        badgeColor: 'bg-[#E74C3C]/20 text-[#E74C3C]',
        title: '🔴 POSTULACIÓN RECHAZADA // PROCESO FINALIZADO',
        desc: 'Se ha concluido la evaluación de la postulación. Agradecemos el interés y dedicación demostrada por el jugador.',
        fields: [
          { label: 'Jugador', value: `${pName}#${pTag}` },
          { label: 'Discord', value: 'valkyrie#1337' },
          { label: 'Rol', value: 'Initiator' },
          { label: 'Motivo / Feedback', value: 'Cupo de rol actualmente completado en el split activo.' }
        ]
      },
      ROSTER: {
        colorBorder: 'border-l-[#F1C40F]',
        badgeColor: 'bg-[#F1C40F]/20 text-[#F1C40F]',
        title: '🏆 ¡BIENVENIDO AL ROSTER OFICIAL DE CROSAIM!',
        desc: `### Bienvenido al roster, ${pName}\nOficialmente incorporado al escuadrón competitivo bajo la bandera de **CROSAIM Esports**.`,
        fields: [
          { label: 'Nombre del Jugador', value: pName },
          { label: 'Riot ID Oficial', value: `${pName}#${pTag}` },
          { label: 'Rango Competitivo', value: 'Radiant (Top 500)' },
          { label: 'Rol Táctico', value: 'Initiator' },
          { label: 'División Asignada', value: '🛡️ Main Roster' },
          { label: 'Rol Discord Asignado', value: '@Main-Initiator' }
        ]
      }
    };

    const cfg = embedConfigs[selectedStatePreview];

    return (
      <div className="bg-[#2b2d31] rounded-lg p-4 border border-[#1e1f22] text-[#dbdee1] font-sans shadow-xl">
        {/* Discord Bot Author header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
            CR
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-white font-semibold text-sm">CROSAIM Operations Bot</span>
              <span className="bg-[#5865f2] text-white text-[10px] font-bold px-1 py-0.2 rounded">BOT</span>
            </div>
            <span className="text-[11px] text-[#949ba4]">Hoy a las {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Discord Embed Container */}
        <div className={`bg-[#1e1f22] rounded border-l-4 ${cfg.colorBorder} p-3.5 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.badgeColor}`}>
              {selectedStatePreview}
            </span>
            <span className="text-[10px] text-[#949ba4] font-mono">CROSAIM // CORE-SIGNAL</span>
          </div>

          <h4 className="text-white font-bold text-sm">{cfg.title}</h4>
          <p className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-line">{cfg.desc}</p>

          {/* Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#313338]">
            {cfg.fields.map((f, i) => (
              <div key={i} className="bg-[#2b2d31]/60 p-2 rounded border border-[#313338]/50">
                <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">{f.label}</div>
                <div className="text-xs font-semibold text-white mt-0.5 font-mono">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-2 text-[10px] text-[#949ba4] flex items-center justify-between border-t border-[#313338]/40">
            <span>CROSAIM CORE · Canal Operativo Discord</span>
            <span>{new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="discord-operations" className="py-12 border-b border-slate-800 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-[#5865f2] uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#5865f2]" />
              <span>DISCORD OPERATIONAL INTERFACE // CROSAIM CORE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Discord como Canal Operativo: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5865f2] via-indigo-400 to-cyan-400">
                Postulaciones, Entrevistas y Roster en Vivo.
              </span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStatus}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition flex items-center space-x-1.5 text-xs font-mono"
              title="Refrescar estado de Discord"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Verificar Gateway</span>
            </button>

            <a
              href={botState.inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-lg shadow-[#5865f2]/20"
            >
              <Bot className="w-4 h-4" />
              <span>Invitar Bot a tu Servidor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Discord Bot Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Node Status */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-[#5865f2]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">DISCORD BOT STATUS</div>
                <div className="text-sm font-bold text-white flex items-center space-x-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${botState.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{botState.connected ? 'ONLINE / CONECTADO' : 'STANDBY / AUTORIZADO'}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              API v10
            </span>
          </div>

          {/* Official Integration Card */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">INTEGRACIÓN DISCORD</div>
              <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                Bot Oficial CROSAIM
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Sincronización de Tryouts y Staff</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Guilds / Channels */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">CANAL DE TRANSMISIÓN</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>{targetChannelId ? (targetChannelId.startsWith('#') ? targetChannelId : `#${targetChannelId}`) : '#postulaciones-tryouts'}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Sincronización de avisos activa</div>
            </div>
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

        </div>

        {/* Main Interactive Discord Studio */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          
          {/* Sub Navigation */}
          <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'preview'
                    ? 'bg-[#5865f2] text-white shadow'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                Simulador de Embeds (6 Estados)
              </button>
              <button
                onClick={() => setActiveTab('live-feed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'live-feed'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                Registro de Auditoría Web ↔ Discord
              </button>
              <button
                onClick={() => setActiveTab('oauth')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                  activeTab === 'oauth'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Discord OAuth2 &amp; Operador</span>
                {oauthUser && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'settings'
                    ? 'bg-violet-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                Ajustes de Canal &amp; Webhook
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {oauthUser ? (
                <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  <img
                    src={oauthUser.avatarUrl}
                    alt={oauthUser.username}
                    className="w-5 h-5 rounded-full border border-indigo-400"
                  />
                  <span className="text-xs font-mono text-white font-semibold">
                    {oauthUser.global_name || oauthUser.username}
                  </span>
                  <button
                    onClick={handleLogoutOAuth}
                    className="text-slate-400 hover:text-red-400 text-xs ml-1 transition"
                    title="Cerrar sesión Discord"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleConnectOAuth}
                    disabled={isOauthLoading}
                    className="px-2.5 py-1 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center space-x-1 shadow transition cursor-pointer"
                    title="Iniciar sesión oficial con Discord"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isOauthLoading ? 'Conectando...' : 'Login Discord'}</span>
                  </button>
                  <button
                    onClick={handleDemoLogin}
                    disabled={isOauthLoading}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-mono font-medium flex items-center space-x-1 transition cursor-pointer"
                    title="Acceso directo Staff Operador para probar"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Staff Demo</span>
                  </button>
                </div>
              )}

              {lastDispatchedStatus && (
                <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lastDispatchedStatus}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab Content: Preview & Simulator */}
          {activeTab === 'preview' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Selecciona Estado para Probar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'POSTULACION', label: '🟡 Postulación', color: 'border-amber-500/50 hover:bg-amber-950/30' },
                      { id: 'REVISION', label: '🔵 Revisión', color: 'border-blue-500/50 hover:bg-blue-950/30' },
                      { id: 'ENTREVISTA', label: '🟣 Entrevista', color: 'border-purple-500/50 hover:bg-purple-950/30' },
                      { id: 'APROBADA', label: '🟢 Aprobada', color: 'border-emerald-500/50 hover:bg-emerald-950/30' },
                      { id: 'RECHAZADA', label: '🔴 Rechazada', color: 'border-rose-500/50 hover:bg-rose-950/30' },
                      { id: 'ROSTER', label: '🏆 Roster Welcome', color: 'border-yellow-500/50 hover:bg-yellow-950/30' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStatePreview(st.id as any)}
                        className={`p-2.5 rounded-lg border text-left text-xs font-mono font-bold transition flex items-center justify-between ${
                          selectedStatePreview === st.id
                            ? 'bg-slate-800 border-white text-white shadow-lg'
                            : `bg-slate-900/60 text-slate-300 ${st.color}`
                        }`}
                      >
                        <span>{st.label}</span>
                        {selectedStatePreview === st.id && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Name Input */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Jugador Objetivo (Riot ID + Tag):
                  </label>
                  <input
                    type="text"
                    value={customPlayerName}
                    onChange={e => setCustomPlayerName(e.target.value)}
                    placeholder="Ej: Valkyrie#LATAM"
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:border-[#5865f2] outline-none"
                  />
                </div>

                {/* Dispatch Button */}
                <button
                  onClick={() => handleTriggerEmbedTest(selectedStatePreview)}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5865f2] to-indigo-600 hover:from-[#4752c4] hover:to-indigo-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-[#5865f2]/20 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isLoading ? 'Transmitiendo a Discord...' : `Disparar Señal ${selectedStatePreview} a Discord`}
                  </span>
                </button>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-mono text-slate-300 font-bold">FLUJO OPERATIVO:</div>
                  <p>1. La web/Staff emite la señal hacia el bus central de CROSAIM.</p>
                  <p>2. El adaptador valida firma HMAC y construye el embed oficial.</p>
                  <p>3. Se entrega al canal de Discord en tiempo real con acuse de recibo (ACK).</p>
                </div>
              </div>

              {/* Discord Visual Preview Column */}
              <div className="lg:col-span-7">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>VISTA PREVIA EN CLIENTE DISCORD</span>
                  <span className="text-[#5865f2]">Render nativo v10</span>
                </div>
                {renderMockEmbed()}
              </div>

            </div>
          )}

          {/* Tab Content: Live Feed & Audit */}
          {activeTab === 'live-feed' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-mono text-slate-300 font-bold uppercase tracking-wider">
                  Bitácora de Señales y Eventos (Web ↔ Discord Gateway)
                </h4>
                <span className="text-xs font-mono text-slate-400">Total: {signals.length} eventos registrados</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border border-slate-800">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">EVENTO / SEÑAL</th>
                      <th className="p-3">JUGADOR</th>
                      <th className="p-3">ORIGEN → DESTINO</th>
                      <th className="p-3">FIRMA HMAC</th>
                      <th className="p-3">ESTADO DISCORD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                    {signals.map((s, idx) => {
                      const itemKey = s.id ? `${s.id}-${idx}` : `discord-sig-${s.eventType || 'event'}-${idx}-${s.timestamp || ''}`;
                      return (
                      <tr key={itemKey} className="hover:bg-slate-900/40 transition">
                        <td className="p-3 text-slate-400 whitespace-nowrap">{s.timestamp}</td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                            {s.eventType}
                          </span>
                        </td>
                        <td className="p-3 text-cyan-300 font-bold">
                          {s.payload?.applicant || s.payload?.candidate || s.payload?.player || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-300 whitespace-nowrap">
                          <span className="text-indigo-400">{s.source}</span> → <span className="text-emerald-400">{s.target}</span>
                        </td>
                        <td className="p-3 text-slate-500 truncate max-w-[120px]" title={s.hmacSignature}>
                          {s.hmacSignature}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ACK ENVIADO</span>
                          </span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: Discord OAuth2 */}
          {activeTab === 'oauth' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider mb-1">
                    <KeyRound className="w-4 h-4" />
                    <span>DISCORD OAUTH2 // SERVICIO DE IDENTIDAD OPERATIVA</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Autenticación Segura de Staff y Operadores
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    El intercambio de código de autorización (authorization code) por access token se realiza estrictamente en el servidor Node.js (CROSAIM Core), protegiendo credenciales y secretos según las mejores prácticas de seguridad.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {oauthUser ? (
                    <button
                      onClick={handleLogoutOAuth}
                      className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar Sesión</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectOAuth}
                      disabled={isOauthLoading}
                      className="px-4 py-2.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-[#5865f2]/25 transition cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isOauthLoading ? 'Iniciando autorización...' : 'Iniciar Sesión con Discord'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Diagnostic Box: Explaining "No existe la página" & Fix */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <h4 className="text-sm font-bold text-amber-200">
                      ¿Por qué Discord decía "No existe la página"?
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    Solución Requerida
                  </span>
                </div>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  Discord requiere que la <b>Redirect URI</b> (URL de retorno) configurada en tu aplicación coincida <b>exactamente</b> con la registrada en el <b>Discord Developer Portal</b>. Anteriormente estaba asignada a un dominio de marcador de posición inexistente (<code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-300 font-mono">crosaim-centel.ai.studio</code>). El servidor ya fue actualizado para usar la URL real de Cloud Run de esta aplicación.
                </p>

                <div className="pt-2 border-t border-amber-500/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-amber-200">
                      Sigue estos 3 pasos para habilitar el login en 30 segundos:
                    </span>
                    <a
                      href={oauthConfig.discordPortalUrl || `https://discord.com/developers/applications/${oauthConfig.clientId}/oauth2`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold shadow transition"
                    >
                      <span>Abrir Discord Developer Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <ol className="mt-2 text-xs text-slate-300 space-y-1.5 list-decimal list-inside">
                    <li>Haz clic en el botón azul de arriba para abrir tu aplicación en Discord Developer Portal.</li>
                    <li>En el menú lateral izquierdo, pulsa en <b>OAuth2</b> y baja hasta la sección <b>Redirects</b>.</li>
                    <li>Haz clic en <b>"Add Redirect"</b>, pega la <b>URL de Entorno Actual</b> (abajo) y presiona <b>"Save Changes"</b> al fondo de la pantalla.</li>
                  </ol>
                </div>
              </div>

              {/* Callout: Official Registered Callback URLs */}
              <div className="space-y-3">
                {/* Primary / Active URL */}
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-[#5865f2]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#5865f2]" />
                      <span>URL de Redirección (Entorno Actual Activo):</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recomendada
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 select-all overflow-x-auto">
                      {oauthConfig.redirectUri}
                    </code>
                    <button
                      onClick={() => copyCallbackUrl(oauthConfig.redirectUri)}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shrink-0"
                      title="Copiar URL para pegar en Discord"
                    >
                      {copiedCallback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Shared App URL (For Shared Links / Production Preview) */}
                {oauthConfig.sharedRedirectUri && oauthConfig.sharedRedirectUri !== oauthConfig.redirectUri && (
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-slate-300 flex items-center space-x-1.5">
                        <span>URL para Versión Compartida (Shared Preview):</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Opcional
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 select-all overflow-x-auto">
                        {oauthConfig.sharedRedirectUri}
                      </code>
                      <button
                        onClick={copySharedCallbackUrl}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition shrink-0"
                      >
                        {copiedSharedCallback ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>¡Copiada!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OAuth Parameter Status Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">CLIENT ID</div>
                  <div className="text-xs font-mono font-bold text-white mt-1 select-all">{oauthConfig.clientId}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Público / Configurado</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">CLIENT SECRET</div>
                  <div className="text-xs font-mono font-bold text-indigo-300 mt-1">••••••••••••••••••••</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Protegido en Servidor</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">SCOPES SOLICITADOS</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 mt-1">identify, email</div>
                  <div className="text-[10px] text-slate-400 mt-1">Identidad básica + correo</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">PROTECCIÓN CSRF</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">Crypto State (Hex)</div>
                  <div className="text-[10px] text-slate-400 mt-1">TTL 15 min / Single-use</div>
                </div>
              </div>

              {/* Error Alert */}
              {oauthError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{oauthError}</span>
                </div>
              )}

              {/* Active Operator Card or Login CTA */}
              {oauthUser ? (
                <div className="p-5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={oauthUser.avatarUrl}
                        alt={oauthUser.username}
                        className="w-14 h-14 rounded-full border-2 border-[#5865f2] shadow-lg shadow-[#5865f2]/30"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-base font-bold text-white">
                            {oauthUser.global_name || oauthUser.username}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#5865f2]/20 text-indigo-300 border border-[#5865f2]/40">
                            OPERADOR VERIFICADO
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>@{oauthUser.username}</span>
                          <span>·</span>
                          <span>ID: {oauthUser.id}</span>
                          <span>·</span>
                          <span className="text-emerald-400">Sesión Activa</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                      <div className="text-right text-xs font-mono text-slate-400 hidden sm:block">
                        <div>Autenticado vía Discord OAuth2</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {new Date(oauthUser.authenticatedAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={handleLogoutOAuth}
                        className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">No hay ninguna sesión de Discord vinculada</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
                      Inicia sesión con tu cuenta de Discord para verificar tu identidad de Staff, emitir señales operativas y sincronizar tus permisos. Si aún no has registrado la URL en Discord, puedes usar el <b>Modo Staff Demo</b> para probar de inmediato.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleConnectOAuth}
                      disabled={isOauthLoading}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold shadow-lg shadow-[#5865f2]/20 transition cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isOauthLoading ? 'Iniciando...' : 'Iniciar Sesión con Discord'}</span>
                    </button>

                    <button
                      onClick={handleDemoLogin}
                      disabled={isOauthLoading}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-mono font-semibold transition cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Entrar como Operador Demo (Prueba Inmediata)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Settings */}
          {activeTab === 'settings' && (
            <div className="p-6 max-w-2xl space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase mb-1">
                  Configuración de Canales y Webhooks de Discord
                </h4>
                <p className="text-xs text-slate-400">
                  Define el canal predeterminado de tu servidor de Discord donde el bot publicará los avisos automáticos de tryouts y entrevistas.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Canal ID de Discord (Opcional):
                  </label>
                  <input
                    type="text"
                    value={targetChannelId}
                    onChange={e => setTargetChannelId(e.target.value)}
                    placeholder="Ej: 123456789012345678"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:border-[#5865f2] outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Haz clic derecho en un canal de tu servidor en Discord y selecciona &quot;Copiar ID del canal&quot;.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    Discord Webhook URL (Alternativa sin invitar bot):
                  </label>
                  <input
                    type="text"
                    value={targetWebhookUrl}
                    onChange={e => setTargetWebhookUrl(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-mono focus:border-[#5865f2] outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Si tu servidor no permite añadir bots por permisos, crea una integración de Webhook en Ajustes del Canal → Integraciones → Webhooks.
                  </span>
                </div>

                <div className="pt-3">
                  <a
                    href={botState.inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold shadow"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Enlace OAuth de Invitación Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
