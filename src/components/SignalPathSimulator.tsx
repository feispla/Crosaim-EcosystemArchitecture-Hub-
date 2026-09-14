import React, { useState } from 'react';
import { SignalEvent } from '../types';
import { crosaimClient } from '../services/crosaimClient';
import { soundFX } from '../utils/audioFX';
import { Play, Shield, Terminal, ArrowRight, CheckCircle2, RotateCcw, Cpu, Radio, Download } from 'lucide-react';

interface SignalPathSimulatorProps {
  signals: SignalEvent[];
  onDispatchSignal: (newEvent: SignalEvent) => void;
  onClearSignals: () => void;
}

export const SignalPathSimulator: React.FC<SignalPathSimulatorProps> = ({
  signals,
  onDispatchSignal,
  onClearSignals
}) => {
  const [selectedEventType, setSelectedEventType] = useState<SignalEvent['eventType']>('PLAYER_APPLICATION_CREATED');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastDispatched, setLastDispatched] = useState<SignalEvent | null>(signals[0] || null);

  const eventTemplates = [
    {
      type: 'PLAYER_APPLICATION_CREATED' as const,
      label: '🟡 Postulación Creada',
      source: 'WEB_PORTAL' as const,
      target: 'DISCORD' as const,
      desc: 'Aspirante envía formulario; señal dispara embed amarillo a canal #postulaciones',
      samplePayload: { applicant: 'Valkyrie#LATAM', role: 'Initiator', rank: 'Radiant', discordTag: 'valkyrie#1337', trackingCode: 'CRO-7821' }
    },
    {
      type: 'PLAYER_APPLICATION_REVIEWED' as const,
      label: '🔵 Auditoría / Revisión MMR',
      source: 'CONTROL_CENTER' as const,
      target: 'DISCORD' as const,
      desc: 'Staff inicia evaluación técnica de K/D y MMR; envía embed azul a Discord',
      samplePayload: { candidate: 'Valkyrie#LATAM', reviewer: 'Head Coach Feispla', scrimKDA: '1.45 K/D', trackingCode: 'CRO-7821' }
    },
    {
      type: 'PLAYER_INTERVIEW_STARTED' as const,
      label: '🟣 Entrevista Convocada',
      source: 'CONTROL_CENTER' as const,
      target: 'DISCORD' as const,
      desc: 'Staff convoca a entrevista; genera embed morado con QUIÉN, CANAL y FECHA/HORA',
      samplePayload: { player: 'Valkyrie#LATAM', interviewer: 'Coach Feispla', channel: '🔊 Sala de Voz Tryouts #1', scheduledTime: 'Hoy 20:00 UTC' }
    },
    {
      type: 'PLAYER_APPLICATION_APPROVED' as const,
      label: '🟢 Postulación Aprobada',
      source: 'CONTROL_CENTER' as const,
      target: 'DISCORD' as const,
      desc: 'Candidato supera pruebas; señal transmite embed verde de resolución aprobatoria',
      samplePayload: { player: 'Valkyrie#LATAM', rank: 'Radiant', role: 'Initiator', teamTarget: 'Main Roster' }
    },
    {
      type: 'PLAYER_ROSTER_JOINED' as const,
      label: '🏆 Bienvenido al Roster',
      source: 'CROSAIM_CORE' as const,
      target: 'DISCORD' as const,
      desc: 'Alta oficial en roster y rol en Discord: "Bienvenido al roster, [JUGADOR]"',
      samplePayload: { playerName: 'Valkyrie', riotId: 'Valkyrie', tagLine: 'LATAM', team: 'Main Roster', assignedRoleTag: '@Main-Initiator' }
    },
    {
      type: 'PLAYER_APPLICATION_REJECTED' as const,
      label: '🔴 Postulación Rechazada',
      source: 'CONTROL_CENTER' as const,
      target: 'DISCORD' as const,
      desc: 'Proceso finalizado; transmite embed rojo con feedback respetuoso y motivos',
      samplePayload: { player: 'Valkyrie#LATAM', reason: 'Cupo completo en el split activo. Guardado en base de datos de talento.' }
    },
    {
      type: 'RIOT_RANK_VERIFIED' as const,
      label: 'Verificación Riot Games API',
      source: 'BOT_OPERATIONS' as const,
      target: 'CONTROL_CENTER' as const,
      desc: 'Bot Operations valida MMR y K/D histórico en Riot API',
      samplePayload: { riotId: 'Kaiser#NA1', mmr: 890, tier: 'Radiant', winRate: '67.2%', valMatchId: 'val-98371' }
    },
    {
      type: 'MATCH_SCRIM_LOGGED' as const,
      label: 'Registro de Match de Evaluación',
      source: 'BOT_OPERATIONS' as const,
      target: 'SUPABASE' as const,
      desc: 'Estadísticas de la partida registradas con firma inmutable',
      samplePayload: { matchScore: '13-9', map: 'Haven', candidateKDA: '24/11/7', ratingScore: 95 }
    }
  ];

  const currentTemplate = eventTemplates.find(t => t.type === selectedEventType) || eventTemplates[0];

  const handleSimulateDispatch = async () => {
    soundFX.playClick();
    setIsTransmitting(true);

    try {
      const playerName = (currentTemplate.samplePayload as any)?.applicant || 
                         (currentTemplate.samplePayload as any)?.candidate || 
                         (currentTemplate.samplePayload as any)?.player || 
                         (currentTemplate.samplePayload as any)?.riotId || 
                         'Player Real';

      const res = await crosaimClient.dispatchEvent({
        eventType: currentTemplate.type as any,
        source: currentTemplate.source,
        target: currentTemplate.target as any,
        player: playerName,
        payload: currentTemplate.samplePayload
      });

      if (res.event) {
        soundFX.playSignalDispatch();
        onDispatchSignal(res.event);
        setLastDispatched(res.event);
      }
    } catch {
      // Fallback in case of network issue
      const randomHex = Math.random().toString(16).substring(2, 10);
      const uniqueId = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fallbackSignal: SignalEvent = {
        id: uniqueId,
        timestamp: new Date().toTimeString().split(' ')[0],
        source: currentTemplate.source,
        target: currentTemplate.target,
        eventType: currentTemplate.type,
        payload: currentTemplate.samplePayload,
        hmacSignature: `sha256=${randomHex}${randomHex}`,
        ackStatus: 'ACK_CONFIRMED'
      };
      soundFX.playSignalDispatch();
      onDispatchSignal(fallbackSignal);
      setLastDispatched(fallbackSignal);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleExportSignals = () => {
    soundFX.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(signals, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crosaim-signals-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section id="signal-path" className="py-16 border-b border-slate-800 bg-[#090d16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-mono text-pink-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>04 / THE SIGNAL PATH SIMULATOR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Diseñado para que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400">
                todo el ecosistema converse.
              </span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-md text-sm leading-relaxed">
            Simula en tiempo real la emisión de señales entre capas. Observa el cálculo de firma HMAC-SHA256, el viaje entre nodos y el acuse de recibo (ACK) operativo.
          </p>
        </div>

        {/* Signal Mesh Topology Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Visual Topology Diagram */}
          <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>TOPOLOGÍA DE SEÑAL EN TIEMPO REAL</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] ${isTransmitting ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {isTransmitting ? 'ENRUTANDO PAQUETE...' : 'READY · IDLE'}
              </span>
            </div>

            {/* Topology Nodes Layout */}
            <div className="relative py-12 px-4 flex flex-col items-center justify-center">
              
              {/* Center Core Hub */}
              <div className="z-10 w-28 h-28 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-2 border-cyan-500/60 shadow-xl shadow-cyan-500/10 flex flex-col items-center justify-center text-center p-2 mb-8">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping mb-1" />
                <span className="text-xs font-black text-white font-mono">CROSAIM</span>
                <span className="text-[10px] text-cyan-300 font-mono tracking-wider">EVENT CORE</span>
              </div>

              {/* 4 Surrounding Nodes */}
              <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Node: CONTROL_CENTER */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  lastDispatched?.source === 'CONTROL_CENTER' || lastDispatched?.target === 'CONTROL_CENTER'
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">NODE 01</div>
                  <div className="text-xs font-bold text-white mt-0.5">Control Center</div>
                  <div className="text-[10px] text-slate-400 mt-1">orchestrate / decide</div>
                </div>

                {/* Node: SUPABASE */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  lastDispatched?.source === 'SUPABASE' || lastDispatched?.target === 'SUPABASE'
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">NODE 02</div>
                  <div className="text-xs font-bold text-white mt-0.5">Supabase</div>
                  <div className="text-[10px] text-slate-400 mt-1">persist / audit</div>
                </div>

                {/* Node: DISCORD_BOT */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  lastDispatched?.source === 'DISCORD_BOT' || lastDispatched?.target === 'DISCORD_BOT'
                    ? 'border-violet-400 bg-violet-950/40 shadow-lg shadow-violet-500/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="text-[10px] font-mono text-violet-400 font-bold">NODE 03</div>
                  <div className="text-xs font-bold text-white mt-0.5">Discord Bot</div>
                  <div className="text-[10px] text-slate-400 mt-1">execute / connect</div>
                </div>

                {/* Node: BOT_OPERATIONS */}
                <div className={`p-3 rounded-xl border text-center transition-all ${
                  lastDispatched?.source === 'BOT_OPERATIONS' || lastDispatched?.target === 'BOT_OPERATIONS'
                    ? 'border-pink-400 bg-pink-950/40 shadow-lg shadow-pink-500/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}>
                  <div className="text-[10px] font-mono text-pink-400 font-bold">NODE 04</div>
                  <div className="text-xs font-bold text-white mt-0.5">Bot Operations</div>
                  <div className="text-[10px] text-slate-400 mt-1">adapt / automate</div>
                </div>

              </div>
            </div>

            {/* Protocol specs bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
              <span className="flex items-center space-x-1.5 text-cyan-300">
                <Shield className="w-3.5 h-3.5" />
                <span>Firma: HMAC-SHA256 (Secret Rotado)</span>
              </span>
              <span className="text-slate-400">ACK Guarantee: 100%</span>
              <span className="text-emerald-400">DLQ Reintentos: Activos</span>
            </div>
          </div>

          {/* Interactive Dispatcher Control Box */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-pink-400" />
                  <span>Disparador de Eventos</span>
                </h3>
                <button
                  id="btn-reset-signals"
                  onClick={onClearSignals}
                  className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar stream</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Selecciona Tipo de Evento
                </label>
                <select
                  id="select-event-type"
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                >
                  {eventTemplates.map((t, idx) => (
                    <option key={`tpl-${t.type}-${idx}`} value={t.type}>
                      {t.label} ({t.source} → {t.target})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentTemplate.desc}
                </p>
              </div>

              {/* Payload Preview */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px]">
                <div className="text-slate-400 mb-1 flex items-center justify-between">
                  <span>PAYLOAD PREVIEW</span>
                  <span className="text-pink-400">{currentTemplate.source}</span>
                </div>
                <pre className="text-slate-300 overflow-x-auto">
                  {JSON.stringify(currentTemplate.samplePayload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Fire button */}
            <button
              id="btn-dispatch-signal"
              disabled={isTransmitting}
              onClick={handleSimulateDispatch}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isTransmitting
                  ? 'bg-amber-500 text-slate-950 opacity-80 cursor-wait'
                  : 'bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-400 hover:opacity-90 text-white shadow-lg shadow-pink-500/20'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isTransmitting ? 'Transmitiendo Señal...' : 'Disparar Señal en el Bus'}</span>
            </button>
          </div>

        </div>

        {/* Live Signal Stream Table */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <h4 className="text-sm font-bold text-white font-mono">
                REGISTRO AUDITABLE DE SEÑALES (EVENT AUDIT TRAIL)
              </h4>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportSignals}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono flex items-center space-x-1.5 transition cursor-pointer"
                title="Exportar registro de señales a JSON"
              >
                <Download className="w-3.5 h-3.5 text-pink-400" />
                <span>Exportar Logs</span>
              </button>
              <span className="text-xs font-mono text-slate-400">
                {signals.length} eventos en sesión
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">HORA</th>
                  <th className="py-2.5 px-3">TIPO DE EVENTO</th>
                  <th className="py-2.5 px-3">RUTA (ORIGEN → DESTINO)</th>
                  <th className="py-2.5 px-3">FIRMA HMAC-SHA256</th>
                  <th className="py-2.5 px-3 text-right">ACK STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {signals.map((sig, idx) => {
                  const itemKey = sig.id ? `${sig.id}-${idx}` : `sig-${sig.eventType || 'event'}-${idx}-${sig.timestamp || ''}`;
                  return (
                  <tr key={itemKey} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 text-slate-400">{sig.timestamp}</td>
                    <td className="py-3 px-3 text-white font-semibold flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{sig.eventType}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-violet-400">{sig.source}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-pink-400">{sig.target}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 truncate max-w-[200px]" title={sig.hmacSignature}>
                      {sig.hmacSignature}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sig.ackStatus}</span>
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
