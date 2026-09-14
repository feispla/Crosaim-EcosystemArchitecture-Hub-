import React, { useState, useEffect } from 'react';
import { DiscordBotState, SignalEvent } from '../types';
import { crosaimClient } from '../services/crosaimClient';
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
  Crown
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
  const [activeTab, setActiveTab] = useState<'preview' | 'live-feed' | 'settings'>('preview');
  const [selectedStatePreview, setSelectedStatePreview] = useState<
    'POSTULACION' | 'REVISION' | 'ENTREVISTA' | 'APROBADA' | 'RECHAZADA' | 'ROSTER'
  >('POSTULACION');
  const [customPlayerName, setCustomPlayerName] = useState('Valkyrie#LATAM');
  const [lastDispatchedStatus, setLastDispatchedStatus] = useState<string | null>(null);

  // Fetch bot status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

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

          {/* Application ID Card */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">APPLICATION ID</div>
              <div className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                {botState.applicationId}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Crosaim.botdiscord // Gateway</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          {/* Guilds / Channels */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">CANAL DE TRANSMISIÓN</div>
              <div className="text-sm font-bold text-white mt-0.5 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>{targetChannelId ? `Canal ${targetChannelId}` : '#postulaciones-tryouts'}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Sincronización bidireccional activa</div>
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

            {lastDispatchedStatus && (
              <div className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lastDispatchedStatus}</span>
              </div>
            )}
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
                    {signals.map(s => (
                      <tr key={s.id} className="hover:bg-slate-900/40 transition">
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
                    ))}
                  </tbody>
                </table>
              </div>
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
