import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Activity, Cpu, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onNavigateTab: (tab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center') => void;
  activeSignalsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateTab, activeSignalsCount }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/80 bg-radial-glow bg-grid-tactical">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Eyebrow Badge */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>DIAGNÓSTICO &amp; ARQUITECTURA 2026</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono bg-violet-950/40 border border-violet-500/30 text-violet-300">
            <Cpu className="w-3.5 h-3.5" />
            <span>3 REPOSITORIOS SINCRONIZADOS</span>
          </div>
        </div>

        {/* Hero Title and Copy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-display">
              El sistema operativo <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-300 to-pink-500">
                de tu ecosistema competitivo.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              CROSAIM conecta comunidad, operaciones y competición en una sola infraestructura diseñada para moverse rápido. 
              Transformamos la web estática en una plataforma operativa viva: con <span className="text-cyan-300 font-semibold">trazabilidad de tryouts</span>, <span className="text-violet-300 font-semibold">seguridad HMAC en webhooks</span> y <span className="text-pink-400 font-semibold">observabilidad en tiempo real</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="btn-hero-arch"
                onClick={() => onNavigateTab('architecture')}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ver Arquitectura &amp; Qué le falta</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                id="btn-hero-tryouts"
                onClick={() => onNavigateTab('tryouts')}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-600 flex items-center space-x-2 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Probar Portal de Tryouts</span>
              </button>

              <button
                id="btn-hero-signals"
                onClick={() => onNavigateTab('signals')}
                className="px-4 py-3 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 transition flex items-center space-x-2 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-pink-400" />
                <span>Simular Señal HMAC ({activeSignalsCount})</span>
              </button>
            </div>
          </div>

          {/* Right Live Telemetry Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold tracking-wide text-slate-200">
                    CROSAIM_CORE // STATUS MESH
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  LATENCY: ~28ms
                </span>
              </div>

              {/* Realtime stats grid */}
              <div className="grid grid-cols-2 gap-3.5 my-4">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">DISCORD GATEWAY</div>
                  <div className="text-lg font-bold text-white flex items-center space-x-1.5 mt-0.5">
                    <span className="text-emerald-400 font-mono">99.98%</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">Shard 0 &amp; 1 Activos</div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">SEÑALES PROCESADAS</div>
                  <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                    {1240 + activeSignalsCount}
                  </div>
                  <div className="text-[10px] text-slate-400">ACK rate 100%</div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">TRYOUTS EVALUADOS</div>
                  <div className="text-lg font-bold text-violet-300 font-mono mt-0.5">
                    48 Candidatos
                  </div>
                  <div className="text-[10px] text-slate-400">Radiant / Inmortal</div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">SEGURIDAD HMAC</div>
                  <div className="text-lg font-bold text-pink-400 font-mono mt-0.5">
                    SHA-256
                  </div>
                  <div className="text-[10px] text-slate-400">Anti-Replay 300s</div>
                </div>
              </div>

              {/* Signal Path Quick summary */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Three Layers · One Direction</span>
                <span className="font-mono text-cyan-400 font-semibold">CORE_01 PROTOCOL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
