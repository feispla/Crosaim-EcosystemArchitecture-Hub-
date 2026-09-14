import React, { useState } from 'react';
import { ECOSYSTEM_LAYERS } from '../data/mockEcosystemData';
import { ExternalLink, Check, Server, Terminal, Shield, ArrowRight } from 'lucide-react';

interface EcosystemLayersProps {
  onSimulateEvent: () => void;
}

export const EcosystemLayers: React.FC<EcosystemLayersProps> = ({ onSimulateEvent }) => {
  const [selectedId, setSelectedId] = useState<'control' | 'bot' | 'ops'>('control');
  const activeLayer = ECOSYSTEM_LAYERS.find(l => l.id === selectedId) || ECOSYSTEM_LAYERS[0];

  const getAccentColor = (accent: string) => {
    switch (accent) {
      case 'cyan':
        return {
          border: 'border-cyan-500/50',
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
      case 'violet':
        return {
          border: 'border-violet-500/50',
          bg: 'bg-violet-500/10',
          text: 'text-violet-400',
          badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
        };
      case 'pink':
      default:
        return {
          border: 'border-pink-500/50',
          bg: 'bg-pink-500/10',
          text: 'text-pink-400',
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
        };
    }
  };

  const accentStyles = getAccentColor(activeLayer.accent);

  return (
    <section id="ecosystem-layers" className="py-16 border-b border-slate-800 bg-[#080b12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              <span>02 / THE ECOSYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Una plataforma. <br />
              <span className="text-slate-400">Tres capas interconectadas.</span>
            </h2>
          </div>
          <p className="text-slate-400 max-w-md text-sm leading-relaxed">
            Cada repositorio tiene una responsabilidad única y delimitada. Juntos forman una arquitectura de eventos reactiva que transforma la actividad comunitaria en decisiones organizativas.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ECOSYSTEM_LAYERS.map(layer => {
            const isSelected = selectedId === layer.id;
            const itemAccent = getAccentColor(layer.accent);

            return (
              <button
                key={layer.id}
                id={`tab-layer-${layer.id}`}
                onClick={() => setSelectedId(layer.id)}
                className={`text-left p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? `${itemAccent.border} ${itemAccent.bg} shadow-lg shadow-black/40`
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${layer.accent === 'cyan' ? 'bg-cyan-400' : layer.accent === 'violet' ? 'bg-violet-400' : 'bg-pink-500'}`} />
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {layer.index} //
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{layer.latencyMs}ms</span>
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wide">
                  {layer.eyebrow}
                </div>
                <div className="text-xl font-bold text-white mt-1 flex items-center justify-between">
                  <span>{layer.name}</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'text-slate-600'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Layer Deep Dive Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border ${accentStyles.border} bg-slate-900/80 backdrop-blur-xl relative overflow-hidden`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left detail */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase border ${accentStyles.badge}`}>
                  {activeLayer.eyebrow}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Worker Nodes: {activeLayer.activeWorkers} online
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {activeLayer.name}
              </h3>

              <p className="text-slate-300 leading-relaxed text-base">
                {activeLayer.description}
              </p>

              {/* Tech Stack tags */}
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2.5">
                  Stack Tecnológico &amp; Capacidades
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLayer.tech.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-md text-xs font-mono bg-slate-950 text-slate-200 border border-slate-800 flex items-center space-x-1.5"
                    >
                      <Check className="w-3 h-3 text-cyan-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  id={`link-repo-${activeLayer.id}`}
                  href={activeLayer.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Explorar Repositorio en GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <button
                  id="btn-layer-sim"
                  onClick={onSimulateEvent}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                >
                  <Server className="w-4 h-4" />
                  <span>Emitir Señal a {activeLayer.name}</span>
                </button>
              </div>
            </div>

            {/* Right Architecture Contract Snippet */}
            <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-slate-400 font-mono ml-1">contract.schema.json</span>
                </div>
                <span className="text-cyan-400 font-semibold">HMAC-SHA256</span>
              </div>

              <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                {selectedId === 'control' && `// Command Layer Contract
{
  "service": "crosaim-control-center",
  "auth": "Bearer JWT (Admin/Coach)",
  "protocol": "tRPC / WebSocket",
  "capabilities": [
    "tryout.reviewCandidate",
    "scrim.createSchedule",
    "roster.promoteMember",
    "analytics.fetchMetrics"
  ],
  "downstream": ["Supabase", "Bot Operations"]
}`}

                {selectedId === 'bot' && `// Community Layer Contract (Python)
{
  "service": "Crosaim.botdiscord",
  "runtime": "Python 3.12 (discord.py)",
  "listeners": [
    "on_member_join",
    "on_voice_state_update",
    "on_reaction_add",
    "slash_commands: /apply, /rank"
  ],
  "webhook_endpoint": "/api/discord/events",
  "security": "X-Crosaim-Signature"
}`}

                {selectedId === 'ops' && `// Adapter Layer Contract (TypeScript)
{
  "service": "crosaim-bot-operations",
  "middleware": "HMAC Verification + RateLimit",
  "integrations": {
    "riot": "v1/val/match & mmr",
    "youtube": "v3/liveBroadcasts",
    "discord": "Webhook Dispatcher"
  },
  "retryPolicy": "exponential_backoff (max: 5)",
  "ackTimeout": "1500ms"
}`}
              </pre>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                <span>ESTADO: VERIFICADO</span>
                <span className="text-emerald-400">IDEMPOTENT ACK REQUIRED</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
