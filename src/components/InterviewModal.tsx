import React, { useState } from 'react';
import { CandidateApplication } from '../types';
import { Volume2, UserCheck, Calendar, Hash, Shield, X, Send, Sparkles } from 'lucide-react';

interface InterviewModalProps {
  candidate: CandidateApplication;
  isOpen: boolean;
  onClose: () => void;
  onConfirmInterview: (details: {
    candidateId: string;
    player: string;
    discordTag: string;
    interviewer: string;
    voiceChannel: string;
    scheduledTime: string;
    notes?: string;
  }) => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onConfirmInterview
}) => {
  const [interviewer, setInterviewer] = useState('Head Coach Feispla');
  const [voiceChannel, setVoiceChannel] = useState('🔊 Sala de Voz Tryouts #1');
  const [scheduledTime, setScheduledTime] = useState('Hoy - 20:00 UTC');
  const [notes, setNotes] = useState('Evaluación de comunicación táctica, disponibilidad y pool de agentes.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmInterview({
      candidateId: candidate.id,
      player: `${candidate.riotId}#${candidate.tagLine}`,
      discordTag: candidate.discordTag,
      interviewer,
      voiceChannel,
      scheduledTime,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Convocatoria a Entrevista de Discord
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                FASE 03 · PROTOCOLO DE AUDICIÓN TÁCTICA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">CANDIDATO:</span>
            <span className="text-white font-bold text-sm">
              {candidate.riotId}#{candidate.tagLine}
            </span>
            <span className="text-purple-300 ml-2">({candidate.discordTag})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">RANGO / ROL:</span>
            <span className="text-emerald-400 font-bold">{candidate.rank}</span>
            <span className="text-slate-300 ml-1.5 font-sans">({candidate.role})</span>
          </div>
        </div>

        {/* Form fields for the 5 mandated dimensions */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dimension 1: QUIÉN -> ENTREVISTADOR */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>QUIÉN → ENTREVISTADOR (Staff CROSAIM):</span>
            </label>
            <select
              value={interviewer}
              onChange={e => setInterviewer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-400 outline-none font-mono"
            >
              <option value="Head Coach Feispla">Head Coach Feispla</option>
              <option value="Coach Táctico Kronos">Coach Táctico Kronos</option>
              <option value="Analista Jefe SovaValk">Analista Jefe SovaValk</option>
              <option value="Staff de Operaciones Esports">Staff de Operaciones Esports</option>
            </select>
          </div>

          {/* Dimension 2: DÓNDE -> CANAL */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>DÓNDE → CANAL DE DISCORD:</span>
            </label>
            <select
              value={voiceChannel}
              onChange={e => setVoiceChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-cyan-400 outline-none font-mono"
            >
              <option value="🔊 Sala de Voz Tryouts #1">🔊 Sala de Voz Tryouts #1 (Oficial)</option>
              <option value="🔊 Sala de Voz Tryouts #2">🔊 Sala de Voz Tryouts #2 (Auxiliar)</option>
              <option value="🔊 Sala Staff / Scrims Privada">🔊 Sala Staff / Scrims Privada</option>
              <option value="#canal-entrevistas-texto">#canal-entrevistas-texto</option>
            </select>
          </div>

          {/* Dimension 3: CUÁNDO -> FECHA / HORA */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>CUÁNDO → FECHA Y HORA DE LA CITA:</span>
            </label>
            <input
              type="text"
              value={scheduledTime}
              onChange={e => setScheduledTime(e.target.value)}
              placeholder="Ej: Hoy 20:00 UTC / Mañana 19:30 Col"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 outline-none font-mono"
              required
            />
          </div>

          {/* Dimension 4: NOTAS Y PUNTOS DE EVALUACIÓN */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">
              NOTAS TÁCTICAS (Se incluirán en el embed de Discord):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-purple-400 outline-none font-sans"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Convocar &amp; Notificar a Discord</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
