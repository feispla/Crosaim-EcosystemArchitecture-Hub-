import React, { useMemo } from 'react';
import { CandidateApplication } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
  Line,
  ComposedChart
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Users, Award, Target, HelpCircle } from 'lucide-react';

interface RecruitmentFunnelDashboardProps {
  candidates: CandidateApplication[];
}

const STAGES_ORDER: Array<{ stage: CandidateApplication['stage']; label: string; shortLabel: string; color: string }> = [
  { stage: 'APPLY', label: '01. Postulación', shortLabel: 'Postulación', color: '#f59e0b' },
  { stage: 'REVIEW', label: '02. Revisión MMR', shortLabel: 'Revisión MMR', color: '#06b6d4' },
  { stage: 'INTERVIEW', label: '03. Entrevista', shortLabel: 'Entrevista', color: '#a855f7' },
  { stage: 'TRYOUT', label: '04. Tryout Scrims', shortLabel: 'Tryout Scrims', color: '#10b981' },
  { stage: 'ROSTER', label: '05. Aprobado Roster', shortLabel: 'Roster Final', color: '#eab308' }
];

export const RecruitmentFunnelDashboard: React.FC<RecruitmentFunnelDashboardProps> = ({ candidates }) => {
  // Funnel calculations
  const funnelData = useMemo(() => {
    const total = candidates.length || 1;
    const stageIndexMap: Record<CandidateApplication['stage'], number> = {
      APPLY: 0,
      REVIEW: 1,
      INTERVIEW: 2,
      TRYOUT: 3,
      ROSTER: 4
    };

    // Count currently at or passed each stage
    return STAGES_ORDER.map((s, idx) => {
      // Candidates currently in this exact stage
      const currentInStage = candidates.filter(c => c.stage === s.stage && c.status !== 'rejected').length;
      
      // Candidates who have reached this stage or beyond (funnel reach)
      const reachedOrBeyond = candidates.filter(c => {
        const candidateStageIdx = stageIndexMap[c.stage] ?? 0;
        return candidateStageIdx >= idx && c.status !== 'rejected';
      }).length;

      // Cumulative conversion rate compared to initial applicants
      const cumulativeSuccessRate = Math.round((reachedOrBeyond / total) * 100);

      // Average rating score of candidates currently at this stage
      const stageCandidates = candidates.filter(c => c.stage === s.stage);
      const avgScore = stageCandidates.length > 0
        ? Math.round(stageCandidates.reduce((acc, c) => acc + (c.ratingScore || 70), 0) / stageCandidates.length)
        : 0;

      return {
        stage: s.stage,
        name: s.shortLabel,
        fullName: s.label,
        color: s.color,
        candidatosActuales: currentInStage,
        alcanzaronEtapa: reachedOrBeyond,
        tasaExitoAcumulada: cumulativeSuccessRate,
        scorePromedio: avgScore
      };
    });
  }, [candidates]);

  // Bottleneck detection
  const bottleneckAnalysis = useMemo(() => {
    if (funnelData.length < 2) return null;

    let maxDrop = -1;
    let bottleneckStage = funnelData[1];
    let fromStage = funnelData[0];

    for (let i = 1; i < funnelData.length; i++) {
      const prev = funnelData[i - 1].alcanzaronEtapa;
      const curr = funnelData[i].alcanzaronEtapa;
      const drop = prev - curr;
      const dropPercentage = prev > 0 ? Math.round((drop / prev) * 100) : 0;

      if (dropPercentage > maxDrop) {
        maxDrop = dropPercentage;
        bottleneckStage = funnelData[i];
        fromStage = funnelData[i - 1];
      }
    }

    const rosterApproved = candidates.filter(c => c.stage === 'ROSTER' && c.status !== 'rejected').length;
    const globalConversion = Math.round((rosterApproved / (candidates.length || 1)) * 100);

    return {
      stageName: bottleneckStage.fullName,
      fromStage: fromStage.fullName,
      dropPercentage: maxDrop,
      globalConversion,
      rosterApproved
    };
  }, [funnelData, candidates]);

  // Success and count by tactical role
  const roleMetrics = useMemo(() => {
    const roles: Array<CandidateApplication['role']> = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
    return roles.map(role => {
      const roleCandidates = candidates.filter(c => c.role === role);
      const totalRole = roleCandidates.length || 1;
      const passedToRoster = roleCandidates.filter(c => c.stage === 'ROSTER' && c.status !== 'rejected').length;
      const inTryoutOrRoster = roleCandidates.filter(c => (c.stage === 'TRYOUT' || c.stage === 'ROSTER') && c.status !== 'rejected').length;
      const avgScore = roleCandidates.length > 0
        ? Math.round(roleCandidates.reduce((acc, c) => acc + (c.ratingScore || 70), 0) / roleCandidates.length)
        : 0;

      return {
        role,
        total: roleCandidates.length,
        enTryout: inTryoutOrRoster,
        aprobadosRoster: passedToRoster,
        tasaAprobacion: Math.round((passedToRoster / totalRole) * 100),
        scorePromedio: avgScore
      };
    });
  }, [candidates]);

  return (
    <div className="mb-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
      {/* Title & KPI Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>ANALÍTICA DE CONVERSIÓN &amp; EMBUDO DE SELECCIÓN</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Tasa de Éxito y Detección de Cuellos de Botella
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de rendimiento en tiempo real para optimizar el paso de aspirantes al roster titular.
          </p>
        </div>

        {/* Diagnostic Snapshot Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Aspirantes</div>
              <div className="text-sm font-bold text-white font-mono">{candidates.length}</div>
            </div>
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Conversión Global</div>
              <div className="text-sm font-bold text-yellow-400 font-mono">
                {bottleneckAnalysis?.globalConversion || 0}%
              </div>
            </div>
          </div>

          {bottleneckAnalysis && (
            <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-amber-300 uppercase">Cuello de Botella Detectado</div>
                <div className="text-xs font-bold text-white truncate max-w-[200px]">
                  {bottleneckAnalysis.stageName} (-{bottleneckAnalysis.dropPercentage}%)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Funnel Chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Embudo de Reclutamiento (Aspirantes vs % Retención)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              5 Etapas Oficiales
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'alcanzaronEtapa') return [value, 'Aspirantes en Embudo'];
                    if (name === 'tasaExitoAcumulada') return [`${value}%`, 'Tasa de Éxito Acumulada'];
                    if (name === 'candidatosActuales') return [value, 'Candidatos en esta Fase'];
                    return [value, name];
                  }}
                  labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                />
                <Bar dataKey="alcanzaronEtapa" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="tasaExitoAcumulada"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8', strokeWidth: 1, stroke: '#07090e' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
              <span>Barras: Cantidad acumulada</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-1 bg-cyan-400 inline-block" />
              <span>Línea: Tasa de avance acumulada (%)</span>
            </div>
          </div>
        </div>

        {/* Performance by Tactical Role (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Rendimiento por Rol Táctico</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">Score &amp; Roster</span>
            </div>

            <div className="space-y-3">
              {roleMetrics.map(rm => (
                <div key={rm.role} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white">{rm.role}</span>
                    <span className="font-mono text-slate-300">
                      {rm.total} aspirantes · <strong className="text-cyan-400">{rm.scorePromedio} pts</strong>
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(rm.tasaAprobacion, 15)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                    <span>En Scrims/Roster: {rm.enTryout}</span>
                    <span className="text-emerald-400 font-semibold">{rm.tasaAprobacion}% éxito</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Insight Note for Leadership */}
          <div className="mt-4 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Recomendación Staff:</strong> Monitorear la fase de <em>{bottleneckAnalysis?.stageName || 'Entrevista'}</em> para agilizar el agendamiento y evitar que aspirantes con alto MMR abandonen el proceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
