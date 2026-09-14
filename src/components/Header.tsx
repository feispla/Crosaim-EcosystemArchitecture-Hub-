import React, { useState, useEffect } from 'react';
import { Layers, Activity, Shield, Terminal, UserPlus, GitFork, ExternalLink, Volume2, VolumeX, Wifi } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

export interface HeaderProps {
  activeTab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center' | 'discord-ops';
  setActiveTab: (tab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center' | 'discord-ops') => void;
  eventCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, eventCount }) => {
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);
  const [latency, setLatency] = useState<number | null>(null);

  // Measure real-time latency to API server
  useEffect(() => {
    let isMounted = true;
    const measurePing = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('/api/health');
        if (res.ok && isMounted) {
          const t1 = performance.now();
          setLatency(Math.round(t1 - t0));
        }
      } catch {
        if (isMounted) setLatency(null);
      }
    };

    measurePing();
    const interval = setInterval(measurePing, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleTabClick = (tab: HeaderProps['activeTab']) => {
    soundFX.playClick();
    setActiveTab(tab);
  };

  const handleToggleSound = () => {
    const next = soundFX.toggle();
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#07090e]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Lockup */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => handleTabClick('ecosystem')}>
          <div className="flex items-center space-x-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 shadow-inner">
            <span className="w-1.5 h-5 bg-cyan-400 rounded-sm animate-pulse" />
            <span className="w-1.5 h-3.5 bg-violet-400 rounded-sm" />
            <span className="w-1.5 h-6 bg-pink-500 rounded-sm" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-wider text-white font-display">
                CROSAIM
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                PRO HUB v2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              COMMUNITY · OPERATIONS · COMPETITION
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
          <button
            id="nav-ecosystem"
            onClick={() => handleTabClick('ecosystem')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'ecosystem'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ecosistema</span>
          </button>

          <button
            id="nav-architecture"
            onClick={() => handleTabClick('architecture')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'architecture'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Arquitectura C4</span>
          </button>

          <button
            id="nav-signals"
            onClick={() => handleTabClick('signals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'signals'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Bus de Señales</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono bg-pink-500/30 text-pink-300 rounded-full">
              {eventCount}
            </span>
          </button>

          <button
            id="nav-tryouts"
            onClick={() => handleTabClick('tryouts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'tryouts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Postulación & Tryouts</span>
          </button>

          <button
            id="nav-control-center"
            onClick={() => handleTabClick('control-center')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'control-center'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Control Center Live</span>
          </button>

          <button
            id="nav-discord-ops"
            onClick={() => handleTabClick('discord-ops')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'discord-ops'
                ? 'bg-[#5865f2]/30 text-white border border-[#5865f2] shadow-sm'
                : 'text-indigo-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#5865f2] animate-pulse" />
            <span>Discord Canal Operativo</span>
          </button>
        </nav>

        {/* Right Status, Audio & GitHub Repo CTA */}
        <div className="flex items-center space-x-2.5">
          {/* Audio FX Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Silenciar efectos de audio' : 'Activar efectos tácticos de audio'}
            className={`p-2 rounded-lg border text-xs transition flex items-center space-x-1 cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-cyan-300 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Live System Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
            <Wifi className="w-3 h-3 animate-pulse" />
            <span>SISTEMA OPERATIVO</span>
          </div>

          {/* Direct Link to CROSAIM GitHub Repository */}
          <a
            id="btn-github-repo"
            href="https://github.com/feispla/Crosaim-EcosystemArchitecture-Hub-"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Ver repositorio en GitHub: Crosaim-EcosystemArchitecture-Hub-"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Repo GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex overflow-x-auto space-x-2 px-4 py-2 bg-slate-950 border-t border-slate-900 text-xs">
        <button
          onClick={() => handleTabClick('ecosystem')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'ecosystem' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
        >
          Ecosistema
        </button>
        <button
          onClick={() => handleTabClick('architecture')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'architecture' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-slate-400'}`}
        >
          Arquitectura C4
        </button>
        <button
          onClick={() => handleTabClick('signals')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'signals' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'text-slate-400'}`}
        >
          Señales ({eventCount})
        </button>
        <button
          onClick={() => handleTabClick('tryouts')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'tryouts' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}
        >
          Tryouts
        </button>
        <button
          onClick={() => handleTabClick('control-center')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'control-center' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'}`}
        >
          Control Center
        </button>
        <button
          onClick={() => handleTabClick('discord-ops')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'discord-ops' ? 'bg-[#5865f2]/30 text-white border border-[#5865f2]' : 'text-indigo-300'}`}
        >
          Discord Ops
        </button>
      </div>
    </header>
  );
};

