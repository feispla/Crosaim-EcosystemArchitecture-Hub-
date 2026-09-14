import React, { useState } from 'react';
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
import { INITIAL_SIGNALS, INITIAL_CANDIDATES, INITIAL_ROSTER } from './data/mockEcosystemData';
import { SignalEvent, CandidateApplication, PlayerRoster } from './types';
import { crosaimClient } from './services/crosaimClient';
import { ShieldCheck, Layers, Activity, UserCheck, Terminal, Cpu, MessageSquare } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<HeaderProps['activeTab']>('ecosystem');
  const [signals, setSignals] = useState<SignalEvent[]>(INITIAL_SIGNALS);
  const [candidates, setCandidates] = useState<CandidateApplication[]>(INITIAL_CANDIDATES);
  const [roster, setRoster] = useState<PlayerRoster[]>(INITIAL_ROSTER);

  // Dispatch signal handler
  const handleDispatchSignal = (newSignal: SignalEvent) => {
    setSignals(prev => [newSignal, ...prev]);
  };

  // Clear signals
  const handleClearSignals = () => {
    setSignals([]);
  };

  // New Application handler
  const handleNewApplication = async (newCand: CandidateApplication) => {
    setCandidates(prev => [newCand, ...prev]);

    // Dispatch official signal to CROSAIM Core -> Discord
    const playerName = `${newCand.riotId}#${newCand.tagLine}`;
    const res = await crosaimClient.dispatchEvent({
      eventType: 'PLAYER_APPLICATION_CREATED',
      source: 'WEB_PORTAL',
      target: 'DISCORD',
      user: 'Aspirante Web',
      player: playerName,
      previousStage: 'NONE',
      newStage: 'APPLY',
      payload: {
        applicant: playerName,
        riotId: newCand.riotId,
        tagLine: newCand.tagLine,
        discordTag: newCand.discordTag,
        role: newCand.role,
        rank: newCand.rank,
        trackingCode: newCand.trackingCode
      }
    });

    if (res.event) {
      setSignals(prev => [res.event, ...prev]);
    }
  };

  // Promote Candidate in Kanban
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

      // Automatically add to official player roster showcase
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
    }

    // Update candidate in local state
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

    // Dispatch event to backend and Discord
    const res = await crosaimClient.dispatchEvent({
      eventType,
      source: 'CONTROL_CENTER',
      target: 'DISCORD',
      user: 'Head Coach / Staff',
      player: playerName,
      previousStage: targetCandidate.stage,
      newStage: nextStage,
      payload: {
        candidate: playerName,
        player: playerName,
        riotId: targetCandidate.riotId,
        tagLine: targetCandidate.tagLine,
        discordTag: targetCandidate.discordTag,
        role: targetCandidate.role,
        rank: targetCandidate.rank,
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

    const playerName = `${targetCandidate.riotId}#${targetCandidate.tagLine}`;
    const res = await crosaimClient.dispatchEvent({
      eventType: 'PLAYER_APPLICATION_REJECTED',
      source: 'CONTROL_CENTER',
      target: 'DISCORD',
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
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Banner: Navigation between Live Web and Architecture Blueprint */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border-b border-cyan-500/30 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-300 font-bold font-mono">CROSAIM ECOSYSTEM &amp; DISCORD GATEWAY SUITE</span>
            <span className="hidden sm:inline text-slate-400">· Discord como canal operativo</span>
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
              <span>Canal Operativo Discord</span>
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
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-[#5865f2]/40 text-xs text-indigo-200 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#5865f2] shrink-0" />
                <span>
                  <strong>Canal Operativo de Discord:</strong> CROSAIM Core como sistema principal sincroniza postulación, revisión, entrevista, aprobación, rechazo y bienvenida al roster en Discord.
                </span>
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
                  <strong>Vista del Bus de Señales:</strong> Registro de señales con firmas criptográficas HMAC-SHA256 y trazabilidad de eventos entre la Web, CROSAIM Core y Discord.
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
                  <strong>Portal Interactivo de Tryouts:</strong> Postulación en vivo con emisión automática de la señal 🟡 PLAYER_APPLICATION_CREATED hacia Discord.
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
                  <strong>Sandbox del Control Center:</strong> Panel de Staff con Kanban táctico y convocatoria de entrevistas conectada a canales de voz de Discord.
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

