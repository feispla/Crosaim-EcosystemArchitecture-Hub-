import React from 'react';
import { Layers, Activity, Shield, Terminal, UserPlus, GitFork, ExternalLink } from 'lucide-react';

export interface HeaderProps {
  activeTab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center' | 'discord-ops';
  setActiveTab: (tab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center' | 'discord-ops') => void;
  eventCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, eventCount }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Lockup */}
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('ecosystem')}>
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
                HUB v2.4
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
            onClick={() => setActiveTab('ecosystem')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
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
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
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
            onClick={() => setActiveTab('signals')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
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
            onClick={() => setActiveTab('tryouts')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
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
            onClick={() => setActiveTab('control-center')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
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
            onClick={() => setActiveTab('discord-ops')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'discord-ops'
                ? 'bg-[#5865f2]/30 text-white border border-[#5865f2] shadow-sm'
                : 'text-indigo-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#5865f2] animate-pulse" />
            <span>Discord Canal Operativo</span>
          </button>
        </nav>

        {/* Right Status & GitHub CTA */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SYSTEM ONLINE · 28ms</span>
          </div>

          <a
            id="btn-github-org"
            href="https://github.com/feispla"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>feispla</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex overflow-x-auto space-x-2 px-4 py-2 bg-slate-950 border-t border-slate-900 text-xs">
        <button
          onClick={() => setActiveTab('ecosystem')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'ecosystem' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
        >
          Ecosistema
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'architecture' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-slate-400'}`}
        >
          Arquitectura C4
        </button>
        <button
          onClick={() => setActiveTab('signals')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'signals' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'text-slate-400'}`}
        >
          Señales ({eventCount})
        </button>
        <button
          onClick={() => setActiveTab('tryouts')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'tryouts' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}
        >
          Tryouts
        </button>
        <button
          onClick={() => setActiveTab('control-center')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'control-center' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'}`}
        >
          Control Center
        </button>
        <button
          onClick={() => setActiveTab('discord-ops')}
          className={`px-3 py-1 rounded-md whitespace-nowrap ${activeTab === 'discord-ops' ? 'bg-[#5865f2]/30 text-white border border-[#5865f2]' : 'text-indigo-300'}`}
        >
          Discord Ops
        </button>
      </div>
    </header>
  );
};
