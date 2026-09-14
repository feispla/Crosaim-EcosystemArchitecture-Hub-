import React, { useState, useMemo } from 'react';
import { CandidateApplication } from '../types';
import { InterviewModal } from './InterviewModal';
import { LayoutDashboard, Users, UserCheck, Check, ArrowRight, ShieldAlert, Sliders, Volume2, Sparkles, Search, Download, Filter } from 'lucide-react';
import { soundFX } from '../utils/audioFX';

interface ControlCenterPreviewProps {
  candidates: CandidateApplication[];
  onPromoteCandidate: (id: string, interviewDetails?: any) => void;
  onRejectCandidate: (id: string) => void;
}

export const ControlCenterPreview: React.FC<ControlCenterPreviewProps> = ({
  candidates,
  onPromoteCandidate,
  onRejectCandidate
}) => {
  const [interviewCandidate, setInterviewCandidate] = useState<CandidateApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  const columns: Array<{ stage: CandidateApplication['stage']; label: string; color: string; indicator: string }> = [
    { stage: 'APPLY', label: '01. Postulación', color: 'border-amber-500/40', indicator: '🟡' },
    { stage: 'REVIEW', label: '02. Revisión MMR', color: 'border-cyan-500/40', indicator: '🔵' },
    { stage: 'INTERVIEW', label: '03. Entrevista', color: 'border-purple-500/40', indicator: '🟣' },
    { stage: 'TRYOUT', label: '04. Tryout Scrim', color: 'border-emerald-500/40', indicator: '🟢' },
    { stage: 'ROSTER', label: '05. Aprobado Roster', color: 'border-yellow-500/40', indicator: '🏆' }
  ];

  const handleAdvanceClick = (cand: CandidateApplication) => {
    soundFX.playClick();
    // If moving from REVIEW to INTERVIEW, open InterviewModal to capture the 5 mandatory dimensions
    if (cand.stage === 'REVIEW') {
      setInterviewCandidate(cand);
    } else {
      soundFX.playSuccess();
      onPromoteCandidate(cand.id);
    }
  };

  const handleInterviewConfirmed = (details: any) => {
    if (interviewCandidate) {
      soundFX.playSuccess();
      onPromoteCandidate(interviewCandidate.id, details);
      setInterviewCandidate(null);
    }
  };

  const handleRejectClick = (id: string) => {
    soundFX.playWarning();
    onRejectCandidate(id);
  };

  // Filter candidates dynamically based on search and role
  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      const matchesSearch = 
        cand.riotId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.tagLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.discordTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cand.trackingCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = selectedRoleFilter === 'ALL' || cand.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [candidates, searchQuery, selectedRoleFilter]);

  // Export pipeline to downloadable JSON
  const handleExportJSON = () => {
    soundFX.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(candidates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `crosaim-pipeline-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section id="control-center-preview" className="py-16 border-b border-slate-800 bg-[#080a10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>THE COMMAND LAYER // LIVE SANDBOX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Control Center: <br />
              <span className="text-slate-400">Gestión táctica de aspirantes sincronizada con Discord.</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
              title="Exportar base de datos de aspirantes a JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar Pipeline</span>
            </button>
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
              ROL ACTIVO: <strong>Head Coach / Staff</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center space-x-1">
              <Volume2 className="w-3 h-3" />
              <span>DISCORD SYNC: ON</span>
            </span>
          </div>
        </div>

        {/* Search and Role Filter Bar */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Riot ID, Discord o Código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Rol:</span>
            </span>
            {['ALL', 'Duelist', 'Initiator', 'Controller', 'Sentinel'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedRoleFilter(role);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                  selectedRoleFilter === role
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {role === 'ALL' ? 'Todos' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Sandbox Notice */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Flujo Operativo Conectado:</strong> Cada cambio de estadio genera automáticamente el evento en CROSAIM Core y transmite el Embed oficial al canal operativo de Discord (🟡 Postulación → 🔵 Revisión → 🟣 Entrevista → 🟢 Aprobada → 🏆 Roster).
            </span>
          </div>
          <span className="font-mono text-emerald-400 shrink-0 hidden sm:inline">
            DISCORD DISPATCHER: ACTIVE
          </span>
        </div>

        {/* Kanban Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colCandidates = filteredCandidates.filter(c => c.stage === col.stage && c.status !== 'rejected');

            return (
              <div
                key={`col-${col.stage}`}
                className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 min-w-[220px] flex flex-col justify-between"
              >
                {/* Column header */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1">
                      <span>{col.indicator}</span>
                      <span>{col.label}</span>
                    </span>
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 font-mono text-[11px] flex items-center justify-center">
                      {colCandidates.length}
                    </span>
                  </div>

                  {/* Cards in column */}
                  <div className="space-y-3 min-h-[180px]">
                    {colCandidates.map((cand, idx) => (
                      <div
                        key={cand.id ? `${cand.id}-${col.stage}` : `cand-${cand.trackingCode}-${col.stage}-${idx}`}
                        className="bg-slate-900/90 rounded-lg p-3 border border-slate-700/60 shadow-sm space-y-2 hover:border-slate-500 transition"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold">{cand.trackingCode}</span>
                          <span className="text-slate-400">{cand.rank}</span>
                        </div>

                        <div className="text-xs font-bold text-white">
                          {cand.riotId}#{cand.tagLine}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{cand.role}</span>
                          <span className="font-mono text-cyan-300 font-semibold">{cand.scrimKDA}</span>
                        </div>

                        <div className="text-[10px] text-purple-300/90 font-mono truncate">
                          Discord: {cand.discordTag}
                        </div>

                        {cand.assignedInterviewer && (
                          <div className="text-[10px] text-amber-300/90 font-mono truncate">
                            🎙️ {cand.assignedInterviewer}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 truncate italic">
                          &quot;{cand.notes}&quot;
                        </div>

                        {/* Action buttons inside card */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                          {cand.stage !== 'ROSTER' ? (
                            <button
                              onClick={() => handleAdvanceClick(cand)}
                              className="w-full py-1 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                            >
                              <span>{cand.stage === 'REVIEW' ? 'Convocar Entrevista' : 'Avanzar'}</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          ) : (
                            <span className="w-full text-center py-1 text-[10px] font-mono font-bold text-yellow-400 bg-yellow-950/40 rounded border border-yellow-500/30 flex items-center justify-center space-x-1">
                              <Sparkles className="w-3 h-3 text-yellow-400" />
                              <span>En Roster</span>
                            </span>
                          )}

                          {cand.stage !== 'ROSTER' && (
                            <button
                              onClick={() => handleRejectClick(cand.id)}
                              className="py-1 px-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-mono transition cursor-pointer"
                              title="Descartar candidato y emitir embed de rechazo"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {colCandidates.length === 0 && (
                      <div className="h-24 border border-dashed border-slate-800/80 rounded-lg flex items-center justify-center text-[11px] text-slate-600 font-mono">
                        Sin aspirantes
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-center">
                  Stage: {col.stage}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modal for Interview Convocatoria */}
      {interviewCandidate && (
        <InterviewModal
          candidate={interviewCandidate}
          isOpen={!!interviewCandidate}
          onClose={() => setInterviewCandidate(null)}
          onConfirmInterview={handleInterviewConfirmed}
        />
      )}
    </section>
  );
};
