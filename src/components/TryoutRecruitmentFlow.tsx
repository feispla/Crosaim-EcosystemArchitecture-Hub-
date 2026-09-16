import React, { useState } from 'react';
import { CandidateApplication } from '../types';
import { soundFX } from '../utils/audioFX';
import { UserCheck, ShieldCheck, Gamepad2, Send, CheckCircle2, Search, ArrowRight, Clock, Star, Copy, Check, Loader2 } from 'lucide-react';

interface TryoutRecruitmentFlowProps {
  candidates: CandidateApplication[];
  onNewApplication: (candidate: CandidateApplication) => void;
}

export const TryoutRecruitmentFlow: React.FC<TryoutRecruitmentFlowProps> = ({
  candidates,
  onNewApplication
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'apply' | 'track'>('apply');
  
  // Application Form State
  const [riotId, setRiotId] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [role, setRole] = useState<CandidateApplication['role']>('Duelist');
  const [rank, setRank] = useState<CandidateApplication['rank']>('Immortal 3');
  const [experience, setExperience] = useState('');
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking & Search State
  const [searchCode, setSearchCode] = useState(candidates[0]?.trackingCode || '');
  const [realtimeSearch, setRealtimeSearch] = useState('');
  const [trackedCandidate, setTrackedCandidate] = useState<CandidateApplication | null>(
    candidates[0] || null
  );

  // Filter candidates in real-time by Riot ID, tag, or tracking code
  const realtimeSearchResults = React.useMemo(() => {
    const q = realtimeSearch.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(c =>
      c.riotId.toLowerCase().includes(q) ||
      c.tagLine.toLowerCase().includes(q) ||
      c.discordTag.toLowerCase().includes(q) ||
      c.trackingCode.toLowerCase().includes(q)
    );
  }, [candidates, realtimeSearch]);

  // Sync if candidates load asynchronously
  React.useEffect(() => {
    if (!trackedCandidate && candidates.length > 0) {
      setTrackedCandidate(candidates[0]);
      setSearchCode(candidates[0].trackingCode);
    }
  }, [candidates, trackedCandidate]);

  const stages: Array<{ key: CandidateApplication['stage']; label: string; desc: string }> = [
    { key: 'APPLY', label: '01. APPLY', desc: 'Postulación y registro de credenciales' },
    { key: 'REVIEW', label: '02. REVIEW', desc: 'Validación de Riot MMR y VODs' },
    { key: 'INTERVIEW', label: '03. INTERVIEW', desc: 'Entrevista de cultura y horarios' },
    { key: 'TRYOUT', label: '04. TRYOUT', desc: 'Scrims y evaluación táctica' },
    { key: 'ROSTER', label: '05. ROSTER', desc: 'Integración al equipo y rol en Discord' }
  ];

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotId || !discordTag || isSubmitting) return;

    setIsSubmitting(true);
    soundFX.playClick();

    const newCode = `CRO-${Math.floor(7000 + Math.random() * 2900)}`;
    const randomRating = Math.floor(88 + Math.random() * 10);

    const newCandidate: CandidateApplication = {
      id: `app-${Date.now()}`,
      trackingCode: newCode,
      riotId: riotId.trim(),
      tagLine: tagLine.trim() || 'LATAM',
      discordTag: discordTag.trim(),
      role,
      rank,
      stage: 'APPLY',
      status: 'pending',
      scrimKDA: '1.25 K/D (Estimado)',
      ratingScore: randomRating,
      submittedAt: 'Justo ahora',
      assignedInterviewer: 'Staff de Operaciones',
      notes: experience || 'Postulación enviada vía CROSAIM Web Portal.'
    };

    setTimeout(() => {
      soundFX.playSuccess();
      onNewApplication(newCandidate);
      setSubmittedCode(newCode);
      setTrackedCandidate(newCandidate);
      setSearchCode(newCode);
      setIsSubmitting(false);

      // Clear form inputs
      setRiotId('');
      setTagLine('');
      setDiscordTag('');
      setExperience('');
    }, 600);
  };

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      soundFX.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleStageCardClick = (stageKey: CandidateApplication['stage']) => {
    soundFX.playClick();
    // Find a candidate in that stage or fallback
    const match = candidates.find(c => c.stage === stageKey && c.status !== 'rejected') || candidates[0];
    if (match) {
      setTrackedCandidate(match);
      setSearchCode(match.trackingCode);
      setRealtimeSearch(match.trackingCode);
    }
    setActiveSubTab('track');
  };

  const handleTrack = () => {
    soundFX.playClick();
    const found = candidates.find(c => c.trackingCode.toUpperCase() === searchCode.trim().toUpperCase());
    if (found) {
      soundFX.playSuccess();
      setTrackedCandidate(found);
    } else {
      soundFX.playWarning();
    }
  };

  const getStageIndex = (stage: CandidateApplication['stage']) => {
    switch (stage) {
      case 'APPLY': return 0;
      case 'REVIEW': return 1;
      case 'INTERVIEW': return 2;
      case 'TRYOUT': return 3;
      case 'ROSTER': return 4;
      default: return 0;
    }
  };

  const currentStageIndex = trackedCandidate ? getStageIndex(trackedCandidate.stage) : 0;

  return (
    <section id="tryout-flow" className="py-16 border-b border-slate-800 bg-[#080b13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <Gamepad2 className="w-4 h-4" />
              <span>03 / THE RECRUITMENT &amp; TRYOUT PIPELINE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Del primer mensaje <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                al roster titular.
              </span>
            </h2>
          </div>

          {/* Subtabs Switcher */}
          <div className="flex items-center space-x-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              id="tab-apply-form"
              onClick={() => {
                soundFX.playClick();
                setActiveSubTab('apply');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'apply'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Postularse a Tryouts
            </button>
            <button
              id="tab-track-status"
              onClick={() => {
                soundFX.playClick();
                setActiveSubTab('track');
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'track'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buscador en Tiempo Real &amp; Tracking
            </button>
          </div>
        </div>

        {/* Visual 5-Step Flow Line - Interactive Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
          {stages.map((st, index) => {
            const isActive = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const countInStage = candidates.filter(c => c.stage === st.key && c.status !== 'rejected').length;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleStageCardClick(st.key)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer group hover:scale-[1.02] ${
                  isCurrent
                    ? 'border-emerald-400 bg-emerald-950/40 shadow-lg shadow-emerald-500/10'
                    : isActive
                    ? 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-emerald-500/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                }`}
                title={`Ver aspirantes en ${st.label}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {st.label}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400">
                      {countInStage}
                    </span>
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                </div>
                <div className="text-xs text-slate-300 leading-snug">
                  {st.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Sub-tab content */}
        {activeSubTab === 'apply' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Box */}
            <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-700/80 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span>Formulario Oficial de Tryouts CROSAIM</span>
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Completa tus datos competitivos. El bot de operaciones validará tu MMR con Riot Games y enviará una señal cifrada al Control Center.
              </p>

              {submittedCode && (
                <div className="mb-6 p-5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs space-y-3 shadow-lg shadow-emerald-950/50">
                  <div className="font-bold text-sm flex items-center space-x-2 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>¡Postulación enviada exitosamente a la cola oficial de CROSAIM!</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/80 border border-emerald-500/30">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Tu Código de Seguimiento Oficial:</div>
                      <div className="font-mono text-lg font-extrabold text-white tracking-wider">{submittedCode}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(submittedCode)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center space-x-1.5 transition cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <span className="text-slate-400 text-[11px]">
                      Se ha transmitido la señal a Discord y a la base de datos de evaluadores.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setActiveSubTab('track');
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow"
                    >
                      <span>Ver Expediente en el Rastreador</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Riot ID (Valorant) *
                    </label>
                    <input
                      id="input-riot-id"
                      required
                      type="text"
                      placeholder="Ej: Valkyrie"
                      value={riotId}
                      onChange={(e) => setRiotId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      TagLine (#)
                    </label>
                    <input
                      id="input-tag-line"
                      type="text"
                      placeholder="Ej: LATAM o NA1"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Usuario de Discord *
                    </label>
                    <input
                      id="input-discord-tag"
                      required
                      type="text"
                      placeholder="Ej: valkyrie_fps#0001"
                      value={discordTag}
                      onChange={(e) => setDiscordTag(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Rol Principal
                    </label>
                    <select
                      id="select-player-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none"
                    >
                      <option value="Duelist">Duelist / Entry Fragger</option>
                      <option value="Initiator">Initiator / Recon</option>
                      <option value="Controller">Controller / Smokes</option>
                      <option value="Sentinel">Sentinel / Anchor</option>
                      <option value="Head Coach">Head Coach / Estratega</option>
                      <option value="Analyst">Analyst / VOD Reviewer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Rango Máximo Alcanzado
                  </label>
                  <select
                    id="select-player-rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none"
                  >
                    <optgroup label="Tier Élite / Radiant">
                      <option value="Radiant">Radiant (Top 500)</option>
                    </optgroup>
                    <optgroup label="Inmortal">
                      <option value="Immortal 3">Immortal 3</option>
                      <option value="Immortal 2">Immortal 2</option>
                      <option value="Immortal 1">Immortal 1</option>
                    </optgroup>
                    <optgroup label="Ascendente">
                      <option value="Ascendant 3">Ascendant 3</option>
                      <option value="Ascendant 2">Ascendant 2</option>
                      <option value="Ascendant 1">Ascendant 1</option>
                    </optgroup>
                    <optgroup label="Diamante">
                      <option value="Diamond 3">Diamond 3</option>
                      <option value="Diamond 2">Diamond 2</option>
                      <option value="Diamond 1">Diamond 1</option>
                    </optgroup>
                    <optgroup label="Platino">
                      <option value="Platinum 3">Platinum 3</option>
                      <option value="Platinum 2">Platinum 2</option>
                      <option value="Platinum 1">Platinum 1</option>
                    </optgroup>
                    <optgroup label="Oro">
                      <option value="Gold 3">Gold 3</option>
                      <option value="Gold 2">Gold 2</option>
                      <option value="Gold 1">Gold 1</option>
                    </optgroup>
                    <optgroup label="Plata">
                      <option value="Silver 3">Silver 3</option>
                      <option value="Silver 2">Silver 2</option>
                      <option value="Silver 1">Silver 1</option>
                    </optgroup>
                    <optgroup label="Bronce">
                      <option value="Bronze 3">Bronze 3</option>
                      <option value="Bronze 2">Bronze 2</option>
                      <option value="Bronze 1">Bronze 1</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Experiencia en Torneos / Disponibilidad de Horarios
                  </label>
                  <textarea
                    id="input-experience"
                    rows={3}
                    placeholder="Cuéntanos en qué torneos has participado y tus horarios para scrims (UTC)..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-emerald-400 outline-none resize-none"
                  />
                </div>

                <button
                  id="btn-submit-application"
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20 cursor-pointer ${
                    isSubmitting
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Sincronizando con Riot Games & Discord...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Postulación a Tryout</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Information Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CRITERIOS DE SELECCIÓN CROSAIM</span>
                </div>
                
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Desde Bronce 1 en adelante:</strong> Postulaciones abiertas para Main Roster, Semillero Academy y Torneos Comunitarios internos.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Validación de Riot API:</strong> El sistema audita automáticamente el winrate y agentes de las últimas 20 partidas.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span><strong>Integración con Discord Bot:</strong> Una vez aprobado, el bot crea una sala de voz privada y asigna el rol @Tryout-Player.</span>
                  </li>
                </ul>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  &quot;No buscamos solo habilidad mecánica, buscamos sincronización operativa y disciplina comunicativa.&quot;
                </div>
              </div>

              {/* Quick try codes */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 text-xs">
                <div className="text-slate-400 mb-2 font-mono text-[11px]">CÓDIGOS DE EJEMPLO PARA RASTREAR:</div>
                <div className="flex flex-wrap gap-2 font-mono">
                  {['CRO-7821', 'CRO-7822', 'CRO-7824', 'CRO-7825'].map(code => (
                    <button
                      key={code}
                      onClick={() => {
                        soundFX.playClick();
                        setSearchCode(code);
                        setRealtimeSearch(code);
                        setActiveSubTab('track');
                        const found = candidates.find(c => c.trackingCode === code);
                        if (found) setTrackedCandidate(found);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition cursor-pointer"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Track Sub-tab */
          <div className="bg-slate-900/90 rounded-2xl border border-slate-700/80 p-6 sm:p-8">
            
            {/* Real-time Search Bar with Back Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <span>Rastreador & Auditoría de Postulaciones</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Consulta el avance de tu prueba en tiempo real sincronizado con el Control Center.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveSubTab('apply');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center space-x-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Nueva Postulación</span>
              </button>
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <label className="block text-xs font-mono text-slate-300 mb-2 text-center uppercase tracking-wider">
                Búsqueda en Tiempo Real de Aspirantes (Riot ID, Tag o Código de Seguimiento)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="input-realtime-candidate-search"
                  type="text"
                  placeholder="Escribe un Riot ID (ej: Kaiser, Valkyrie), tag (NA1, 0001) o código (CRO-7821)..."
                  value={realtimeSearch}
                  onChange={(e) => {
                    const query = e.target.value;
                    setRealtimeSearch(query);
                    const q = query.trim().toLowerCase();
                    if (q) {
                      const match = candidates.find(c =>
                        c.riotId.toLowerCase().includes(q) ||
                        c.tagLine.toLowerCase().includes(q) ||
                        c.discordTag.toLowerCase().includes(q) ||
                        c.trackingCode.toLowerCase().includes(q)
                      );
                      if (match) {
                        setTrackedCandidate(match);
                        setSearchCode(match.trackingCode);
                      }
                    }
                  }}
                  className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
                />
                {realtimeSearch && (
                  <button
                    onClick={() => {
                      setRealtimeSearch('');
                      soundFX.playClick();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Real-time Match Results Carousel / Quick Select */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {realtimeSearch ? `${realtimeSearchResults.length} aspirantes coincidentes:` : 'Aspirantes disponibles:'}
                </span>
                {realtimeSearchResults.slice(0, 5).map(c => {
                  const isSelected = trackedCandidate?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        soundFX.playClick();
                        setTrackedCandidate(c);
                        setSearchCode(c.trackingCode);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span className="font-bold">{c.riotId}</span>
                      <span className="text-slate-500">#{c.tagLine}</span>
                      <span className="text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-cyan-950/40">
                        {c.trackingCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Card Details */}
            {trackedCandidate ? (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 max-w-2xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">
                        EXPEDIENTE {trackedCandidate.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(trackedCandidate.trackingCode)}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center space-x-1"
                        title="Copiar código"
                      >
                        {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <h4 className="text-xl font-bold text-white mt-0.5">
                      {trackedCandidate.riotId}#{trackedCandidate.tagLine}
                    </h4>
                    <p className="text-xs font-mono text-slate-400">
                      Discord: {trackedCandidate.discordTag}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      trackedCandidate.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : trackedCandidate.status === 'in-review'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span className="uppercase">{trackedCandidate.stage} · {trackedCandidate.status}</span>
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Enviado: {trackedCandidate.submittedAt}
                    </div>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">ROL</div>
                    <div className="text-sm font-bold text-white mt-0.5">{trackedCandidate.role}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">RANGO</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">{trackedCandidate.rank}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">SCRIM K/D</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{trackedCandidate.scrimKDA}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400">RATING SCORE</div>
                    <div className="text-sm font-bold text-violet-300 mt-0.5 flex items-center justify-center space-x-1">
                      <Star className="w-3 h-3 fill-violet-400 text-violet-400" />
                      <span>{trackedCandidate.ratingScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Notes by Staff */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>EVALUADOR ASIGNADO: <strong className="text-slate-200">{trackedCandidate.assignedInterviewer || 'Pendiente'}</strong></span>
                    <span className="text-emerald-400">Sincronizado con Discord</span>
                  </div>
                  <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                    &quot;{trackedCandidate.notes}&quot;
                  </p>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                No se encontró ninguna postulación que coincida con &quot;{realtimeSearch || searchCode}&quot;.
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
};
