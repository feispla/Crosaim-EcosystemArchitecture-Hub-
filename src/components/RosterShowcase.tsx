import React, { useState } from 'react';
import { PlayerRoster } from '../types';
import { Trophy, Swords, Calendar, Flame, ShieldAlert } from 'lucide-react';

interface RosterShowcaseProps {
  roster: PlayerRoster[];
}

export const RosterShowcase: React.FC<RosterShowcaseProps> = ({ roster }) => {
  const [selectedTeam, setSelectedTeam] = useState<'Main Roster' | 'Academy Team'>('Main Roster');

  const filteredPlayers = roster.filter(p => p.team === selectedTeam);

  const upcomingMatches = [
    {
      tournament: 'VALORANT CHALLENGERS LATAM',
      stage: 'Semifinal Upper Bracket',
      date: 'Viernes 18:00 UTC',
      opponent: 'KRÜ Esports Academy',
      status: 'UPCOMING',
      mapPick: 'Ascent / Bind / Haven'
    },
    {
      tournament: 'CROSAIM INVITATIONAL CUP #4',
      stage: 'Grand Finals BO5',
      date: 'Domingo 21:00 UTC',
      opponent: 'Leviatán Academy',
      status: 'SCHEDULED',
      mapPick: 'Split / Lotus / Sunset'
    }
  ];

  return (
    <section id="roster" className="py-16 border-b border-slate-800 bg-[#07090e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>05 / COMPETITIVE DIVISION &amp; ACTIVE ROSTER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              El talento que compite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                bajo nuestra bandera.
              </span>
            </h2>
          </div>

          {/* Team Filter Pills */}
          <div className="flex items-center space-x-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedTeam('Main Roster')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedTeam === 'Main Roster'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Main Roster (Tier 1)
            </button>
            <button
              onClick={() => setSelectedTeam('Academy Team')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedTeam === 'Academy Team'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Academy Team (Semillero)
            </button>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredPlayers.length === 0 ? (
            <div className="col-span-full py-12 px-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 text-center">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Sin jugadores registrados en {selectedTeam}</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-2">
                Los aspirantes que aprueben el tryout y pasen a la fase <strong>ROSTER</strong> en el Control Center se registrarán automáticamente aquí y en Supabase.
              </p>
              <span className="text-xs font-mono text-cyan-400">Sincronización en tiempo real activa vía Supabase &amp; Discord</span>
            </div>
          ) : (
            filteredPlayers.map(player => (
            <div
              key={player.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all p-5 flex flex-col justify-between group relative overflow-hidden shadow-lg"
            >
              <div className="space-y-4">
                {/* Header & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {player.rank}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{player.status}</span>
                  </span>
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center space-x-3.5">
                  <img
                    src={player.avatar}
                    alt={player.handle}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700 group-hover:border-cyan-400 transition"
                  />
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                      {player.handle}
                    </h3>
                    <div className="text-xs text-slate-400">{player.name}</div>
                    <div className="text-[11px] font-mono text-violet-400 font-semibold mt-0.5">
                      {player.role}
                    </div>
                  </div>
                </div>

                {/* Preferred Agents */}
                <div>
                  <div className="text-[10px] font-mono text-slate-400 mb-1.5">AGENTES PREDILECTOS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {player.preferredAgents.map((ag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {ag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-950/60">
                  <span className="text-[10px] font-mono text-slate-400 block">K/D RATIO</span>
                  <span className="text-sm font-bold text-white font-mono">{player.kda}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60">
                  <span className="text-[10px] font-mono text-slate-400 block">WIN RATE</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{player.winRate}</span>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Upcoming Matches & Scrims Card */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-bold">
              <Swords className="w-4 h-4 text-pink-400" />
              <span>CALENDARIO DE COMPETICIONES OFICIALES</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Sincronizado vía Bot Operations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-cyan-400 font-bold">{m.tournament}</span>
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{m.date}</span>
                    </span>
                  </div>
                  <div className="text-base font-bold text-white flex items-center space-x-2">
                    <span>CROSAIM</span>
                    <span className="text-pink-400 font-mono text-xs">VS</span>
                    <span>{m.opponent}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {m.stage} · Map Pool: <span className="font-mono text-slate-300">{m.mapPick}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Flame className="w-3 h-3" />
                    <span>TRANSMISIÓN EN VIVO PROGRAMADA</span>
                  </span>
                  <span className="text-slate-500">Discord Alert: Automático</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
