import React from 'react';
import { GitFork, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: 'ecosystem' | 'architecture' | 'tryouts' | 'signals' | 'control-center') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070a] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-slate-900 p-1.5 rounded border border-slate-800">
                <span className="w-1.5 h-4 bg-cyan-400 rounded-sm" />
                <span className="w-1.5 h-2.5 bg-violet-400 rounded-sm" />
                <span className="w-1.5 h-4.5 bg-pink-500 rounded-sm" />
              </div>
              <span className="text-lg font-black text-white tracking-wider font-display">
                CROSAIM
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              El sistema operativo de tu ecosistema competitivo. Arquitectura de 3 capas conectada por señales observables, seguridad HMAC y automatización de tryouts.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CORE_01 PROTOCOL · HMAC SHA-256 SECURED</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="font-mono text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Módulos Web
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigateTab('ecosystem')}
                  className="hover:text-cyan-400 transition cursor-pointer"
                >
                  Ecosistema de 3 Capas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('architecture')}
                  className="hover:text-violet-400 transition cursor-pointer"
                >
                  Arquitectura C4 &amp; Diagnóstico
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('signals')}
                  className="hover:text-pink-400 transition cursor-pointer"
                >
                  Simulador de Señales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('tryouts')}
                  className="hover:text-emerald-400 transition cursor-pointer"
                >
                  Portal de Tryouts &amp; Onboarding
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('control-center')}
                  className="hover:text-amber-400 transition cursor-pointer"
                >
                  Control Center Sandbox
                </button>
              </li>
            </ul>
          </div>

          {/* Repositories */}
          <div className="space-y-2">
            <div className="font-mono text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Repositorios Oficiales
            </div>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>
                <a
                  href="https://github.com/feispla/crosaim-control-center"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition"
                >
                  <GitFork className="w-3 h-3" />
                  <span>crosaim-control-center</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/feispla/Crosaim.botdiscord"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-violet-400 hover:text-violet-300 transition"
                >
                  <GitFork className="w-3 h-3" />
                  <span>Crosaim.botdiscord</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/feispla/crosaim-bot-operations"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1 text-pink-400 hover:text-pink-300 transition"
                >
                  <GitFork className="w-3 h-3" />
                  <span>crosaim-bot-operations</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/feispla"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition flex items-center space-x-1"
                >
                  <span>Organización: @feispla</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            © 2026 CROSAIM ECOSYSTEM. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-1">
            <span>Diseñado para alto rendimiento competitivo con</span>
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span>para la comunidad gamer.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
