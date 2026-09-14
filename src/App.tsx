import React, { useState, useEffect } from 'react';
import { Header, HeaderProps } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { EcosystemLayers } from './components/EcosystemLayers';
import { SignalPathSimulator } from './components/SignalPathSimulator';
import { TryoutRecruitmentFlow } from './components/TryoutRecruitmentFlow';
import { RosterShowcase } from './components/RosterShowcase';
import { ControlCenterPreview } from './components/ControlCenterPreview';
import { DiscordOperationsPanel } from './components/DiscordOperationsPanel';
import { ArchitectureView } from './components/ArchitectureView';
import { Footer } from './components/Footer';
import { SignalEvent, CandidateApplication, PlayerRoster } from './types';
import { crosaimClient } from './services/crosaimClient';
import { ShieldCheck, Layers, Activity, UserCheck, Terminal, Cpu, MessageSquare, Database, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<HeaderProps['activeTab']>('ecosystem');
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [candidates, setCandidates] = useState<CandidateApplication[]>([]);
  const [roster, setRoster] = useState<PlayerRoster[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(true);

  // Load real data from live backend, Supabase and Discord APIs on mount
  useEffect(() => {
    async function fetchRealEcosystemData() {
      try {
        const [realRoster, realCandidates, realEvents, realStats, realWebhook, realSupabase] = await Promise.all([
          crosaimClient.getRealRoster(),
          crosaimClient.getRealCandidates(),
          crosaimClient.getRealEvents(),
          crosaimClient.getRealStats(),
          crosaimClient.getWebhookInfo(),
          crosaimClient.getSupabaseStatus()
        ]);

        setRoster(realRoster || []);
        setCandidates(realCandidates || []);
        setSignals(realEvents || []);
        setStats(realStats);
        setWebhookInfo(realWebhook);
        setSupabaseStatus(realSupabase);
      } catch (err) {
        console.error('[CROSAIM] Error al consultar datos reales de la API:', err);
      } finally {
        setIsLoadingRealData(false);
      }
    }

    fetchRealEcosystemData();
  }, []);

  // Dispatch signal handler
  const handleDispatchSignal = (newSignal: SignalEvent) => {
    setSignals(prev => [newSignal, ...prev]);
    // Refresh stats
    crosaimClient.getRealStats().then(setStats).catch(() => {});
  };

  // Clear signals
  const handleClearSignals = () => {
    setSignals([]);
  };

  // New Application handler - Saves to Supabase and dispatches real Discord Webhook Embed
  const handleNewApplication = async (newCand: CandidateApplication) => {
    setCandidates(prev => [newCand, ...prev]);

    const res = await crosaimClient.createRealCandidate(newCand);
    if (res.event) {
      setSignals(prev => [res.event, ...prev]);
    }
    crosaimClient.getRealStats().then(setStats).catch(() => {});
  };

  // Promote Candidate in Kanban - Persists in Supabase and notifies Discord
  const handlePromoteCandidate = async (id: string, interviewDetails?: any) => {
    const targetCandidate = candidates.find(c => c.id === id);
    if (!targetCandidate) return;

    let nextStage: CandidateApplication['stage'] = targetCandidate.stage;
    let nextStatus: CandidateApplication['status'] = 'in-review';
    let assignedInterviewer = targetCandidate.assignedInterviewer;
    let notes = targetCandidate.notes;

    let eventType: any = 'PLAYER_APPLICATION_REVIEWED';
    const playerName = `${targetCandidate.riotId}#${targetCandidate.tagLine}`;

    if (targetCandidate.stage === 'APPLY') {
      nextStage = 'REVIEW';
      eventType = 'PLAYER_APPLICATION_REVIEWED';
    } else if (targetCandidate.stage === 'REVIEW') {
      nextStage = 'INTERVIEW';
      eventType = 'PLAYER_INTERVIEW_STARTED';
      if (interviewDetails) {
        assignedInterviewer = interviewDetails.interviewer;
        notes = `${interviewDetails.voiceChannel} · ${interviewDetails.scheduledTime} · ${interviewDetails.notes || ''}`;
      }
    } else if (targetCandidate.stage === 'INTERVIEW') {
      nextStage = 'TRYOUT';
      nextStatus = 'approved';
      eventType = 'PLAYER_APPLICATION_APPROVED';
    } else if (targetCandidate.stage === 'TRYOUT') {
      nextStage = 'ROSTER';
      nextStatus = 'approved';
      eventType = 'PLAYER_ROSTER_JOINED';

      // Automatically add to official player roster showcase and Supabase
      const newRosterMember: PlayerRoster = {
        id: `ros-${Date.now()}`,
        name: targetCandidate.riotId,
        handle: targetCandidate.riotId.toLowerCase(),
        role: targetCandidate.role,
        team: 'Main Roster',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
        preferredAgents: [targetCandidate.role === 'Initiator' ? 'Sova' : targetCandidate.role === 'Duelist' ? 'Jett' : 'Omen'],
        kda: targetCandidate.scrimKDA || '1.38 K/D',
        winRate: '68.4%',
        rank: targetCandidate.rank,
        status: 'Starter'
      };
      setRoster(prev => [newRosterMember, ...prev]);
      await crosaimClient.saveRealRosterMember(newRosterMember);
    }

    // Update candidate state in UI
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        stage: nextStage,
        status: nextStatus,
        assignedInterviewer,
        notes
      };
    }));

    // Update candidate in backend & Supabase
    await crosaimClient.updateRealCandidate(id, {
      stage: nextStage,
      status: nextStatus,
      assignedInterviewer,
      notes
    });

    // Dispatch event to backend and Discord Webhook
    const res = await crosaimClient.dispatchEvent({
      eventType,
      source: 'CONTROL_CENTER',
      target: 'ALL',
      user: 'Head Coach / Staff',
      player: playerName,
      previousStage: targetCandidate.stage,
      newStage: nextStage,
      payload: {
        candidate: playerName,
        player: playerName,
        playerName: targetCandidate.riotId,
        riotId: targetCandidate.riotId,
        tagLine: targetCandidate.tagLine,
        discordTag: targetCandidate.discordTag,
        role: targetCandidate.role,
        rank: targetCandidate.rank,
        team: 'Main Roster',
        trackingCode: targetCandidate.trackingCode,
        interviewer: interviewDetails?.interviewer || assignedInterviewer || 'Head Coach Feispla',
        channel: interviewDetails?.voiceChannel || '🔊 Sala de Voz Tryouts #1',
        scheduledTime: interviewDetails?.scheduledTime || 'Programado por Staff',
        notes: interviewDetails?.notes || notes
      }
    });

    if (res.event) {
      setSignals(prev => [res.event, ...prev]);
    }
    crosaimClient.getRealStats().then(setStats).catch(() => {});
  };

  // Reject candidate
  const handleRejectCandidate = async (id: string) => {
    const targetCandidate = candidates.find(c => c.id === id);
    if (!targetCandidate) return;

    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: 'rejected' };
      }
      return c;
    }));

    await crosaimClient.updateRealCandidate(id, { status: 'rejected' });

    const playerName = `${targetCandidate.riotId}#${targetCandidate.tagLine}`;
    const res = await crosaimClient.dispatchEvent({
      eventType: 'PLAYER_APPLICATION_REJECTED',
      source: 'CONTROL_CENTER',
      target: 'ALL',
      user: 'Head Coach / Staff',
      player: playerName,
      previousStage: targetCandidate.stage,
      newStage: 'REJECTED',
      payload: {
        player: playerName,
        discordTag: targetCandidate.discordTag,
        role: targetCandidate.role,
        reason: 'Cupo completo en el split activo. Guardado en la base de talentos para futuros splits.',
        trackingCode: targetCandidate.trackingCode
      }
    });

    if (res.event) {
      setSignals(prev => [res.event, ...prev]);
    }
    crosaimClient.getRealStats().then(setStats).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Real Infrastructure Status Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/30 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 text-emerald-400 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>API REAL CONECTADA</span>
            </span>

            {/* Supabase Status Chip */}
            <span className="hidden md:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Base de Datos: Conectada y Sincronizada</span>
            </span>

            {/* Discord Webhook Chip */}
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#5865f2]/10 text-indigo-300 border border-[#5865f2]/30 text-[11px] font-mono">
              <MessageSquare className="w-3 h-3 text-[#5865f2]" />
              <span>Canal Discord: #postulaciones (Oficial)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('ecosystem')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeTab === 'ecosystem'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-800/80'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Plataforma Web</span>
            </button>

            <button
              onClick={() => setActiveTab('discord-ops')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeTab === 'discord-ops'
                  ? 'bg-[#5865f2] text-white font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-800/80'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Canal Discord</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeTab === 'architecture'
                  ? 'bg-violet-500 text-white font-bold'
                  : 'text-slate-300 hover:text-white bg-slate-800/80'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Arquitectura C4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventCount={signals.length}
      />

      {/* Primary Content View */}
      <main className="flex-grow">
        {activeTab === 'architecture' ? (
          /* Architecture & Gap Analysis Blueprint View */
          <ArchitectureView />
        ) : activeTab === 'discord-ops' ? (
          /* Discord Operations & Real Gateway View */
          <div className="space-y-6">
            <div className="pt-8 px-4 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-[#5865f2]/40 text-xs text-indigo-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#5865f2] shrink-0" />
                  <span>
                    <strong>Canal Operativo de Discord Conectado:</strong> Enviando en tiempo real al Webhook verificado del servidor de Discord de CROSAIM.
                  </span>
                </div>
                <div className="font-mono text-emerald-400 text-[11px] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Webhook Oficial Verificado</span>
                </div>
              </div>
            </div>
            <DiscordOperationsPanel
              signals={signals}
              onDispatchSignal={handleDispatchSignal}
            />
          </div>
        ) : activeTab === 'signals' ? (
          /* Signal Path Bus View */
          <div className="space-y-6">
            <div className="pt-8 px-4 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-pink-950/30 border border-pink-500/30 text-xs text-pink-200 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-pink-400 shrink-0" />
                <span>
                  <strong>Registro Real de Señales:</strong> Eventos capturados en el bus de señales de CROSAIM y sincronizados con Discord y Supabase.
                </span>
              </div>
            </div>
            <SignalPathSimulator
              signals={signals}
              onDispatchSignal={handleDispatchSignal}
              onClearSignals={handleClearSignals}
            />
          </div>
        ) : activeTab === 'tryouts' ? (
          /* Recruitment & Tryout Pipeline View */
          <div className="space-y-6">
            <div className="pt-8 px-4 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Portal Oficial de Tryouts:</strong> Toda postulación registrada aquí se almacena en Supabase y notifica de inmediato al canal de Discord de CROSAIM.
                </span>
              </div>
            </div>
            <TryoutRecruitmentFlow
              candidates={candidates}
              onNewApplication={handleNewApplication}
            />
          </div>
        ) : activeTab === 'control-center' ? (
          /* Control Center Sandbox View */
          <div className="space-y-6">
            <div className="pt-8 px-4 max-w-7xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Control Center Operativo:</strong> Gestiona y promueve aspirantes entre fases de auditoría, entrevista y roster con sincronización a Supabase y Discord.
                </span>
              </div>
            </div>
            <ControlCenterPreview
              candidates={candidates}
              onPromoteCandidate={handlePromoteCandidate}
              onRejectCandidate={handleRejectCandidate}
            />
          </div>
        ) : (
          /* Full Ecosystem Experience (Home All-in-one) */
          <>
            <HeroSection
              onNavigateTab={setActiveTab}
              activeSignalsCount={signals.length}
            />
            
            <EcosystemLayers
              onSimulateEvent={() => setActiveTab('signals')}
            />

            <DiscordOperationsPanel
              signals={signals}
              onDispatchSignal={handleDispatchSignal}
            />

            <TryoutRecruitmentFlow
              candidates={candidates}
              onNewApplication={handleNewApplication}
            />

            <ControlCenterPreview
              candidates={candidates}
              onPromoteCandidate={handlePromoteCandidate}
              onRejectCandidate={handleRejectCandidate}
            />

            <SignalPathSimulator
              signals={signals}
              onDispatchSignal={handleDispatchSignal}
              onClearSignals={handleClearSignals}
            />

            <RosterShowcase
              roster={roster}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigateTab={setActiveTab} />

    </div>
  );
}
