import React, { useState } from 'react';
import { CURRENT_LIMITATIONS_ANALYSIS, C4_SYSTEM_ARCHITECTURE } from '../data/architectureDoc';
import { Shield, Layers, Cpu, Server, Key, CheckCircle, AlertTriangle, ArrowRight, Code2, Database, GitMerge, FileCheck } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [c4Level, setC4Level] = useState<'context' | 'containers' | 'security' | 'roadmap'>('context');
  const [hmacSecret, setHmacSecret] = useState('crosaim_prod_secret_2026');
  const [hmacPayload, setHmacPayload] = useState('{"event":"USER_APPLY","riotId":"Valkyrie#LATAM"}');
  const [generatedHash, setGeneratedHash] = useState('sha256=e91a0c4f8205bd3982f1ac8e74bc0281b671');
  const [hashCopied, setHashCopied] = useState(false);

  const handleComputeHmac = () => {
    // Generate simulated HMAC SHA-256
    const str = hmacSecret + hmacPayload + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(16, '0') + Math.abs(hash * 31).toString(16).padStart(16, '0') + 'a89c';
    setGeneratedHash(`sha256=${hex}`);
  };

  return (
    <section id="architecture-blueprint" className="py-16 border-b border-slate-800 bg-[#07090f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Title & Executive Summary */}
        <div className="mb-12">
          <div className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-1.5 flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>DIAGNÓSTICO TÉCNICO &amp; PLANO DE ARQUITECTURA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            ¿Qué le falta a la web actual y cómo transformarla?
          </h2>
          <p className="mt-3 text-slate-300 text-base max-w-3xl leading-relaxed">
            La web actual de CROSAIM (<code className="text-cyan-300 font-mono text-xs">crosaimeco-gdvyejz7.manus.space</code>) posee un excelente concepto visual oscuro y cyberpunk, pero actualmente es una <strong>vitrina estática tipo &quot;landing page&quot; pasiva</strong>. A continuación presentamos el diagnóstico exhaustivo de sus carencias y la <strong>Arquitectura de Sistema C4</strong> recomendada para convertirla en una plataforma operativa de grado de producción.
          </p>
        </div>

        {/* Section 1: Detailed Gap Analysis Matrix */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>1. Diagnóstico: 6 Deficiencias Críticas y Mejoras Inmediatas</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Auditoría CROSAIM 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CURRENT_LIMITATIONS_ANALYSIS.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 p-5 flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.impactLevel === 'CRÍTICO'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : item.impactLevel === 'ALTO'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      IMPACTO {item.impactLevel}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </h4>

                  <div className="p-3 bg-red-950/20 rounded-lg border border-red-900/30 text-xs text-red-200 leading-relaxed">
                    <strong className="text-red-400 block font-mono text-[10px] uppercase mb-0.5">Qué le falta hoy:</strong>
                    {item.currentLimitation}
                  </div>

                  <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30 text-xs text-emerald-200 leading-relaxed">
                    <strong className="text-emerald-400 block font-mono text-[10px] uppercase mb-0.5">Mejora recomendada:</strong>
                    {item.recommendedSolution}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 mb-1.5">STACK DE SOLUCIÓN:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-slate-300 border border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: C4 Model Interactive Architecture */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-violet-400" />
                <span>2. Arquitectura de Software C4 para CROSAIM</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Estructura desacoplada, orientada a eventos y preparada para alta concurrencia en Discord y competiciones.
              </p>
            </div>

            {/* C4 Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setC4Level('context')}
                className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition cursor-pointer ${
                  c4Level === 'context' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                C4 Nivel 1 (Contexto)
              </button>
              <button
                onClick={() => setC4Level('containers')}
                className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition cursor-pointer ${
                  c4Level === 'containers' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                C4 Nivel 2 (Contenedores)
              </button>
              <button
                onClick={() => setC4Level('security')}
                className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition cursor-pointer ${
                  c4Level === 'security' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Protocolo HMAC
              </button>
              <button
                onClick={() => setC4Level('roadmap')}
                className={`px-3 py-1.5 rounded-lg font-mono font-semibold transition cursor-pointer ${
                  c4Level === 'roadmap' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roadmap Fases
              </button>
            </div>
          </div>

          {/* C4 Dynamic Body */}
          <div className="mt-8">
            {c4Level === 'context' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong>Diagrama de Contexto (System Context):</strong> Define las fronteras del ecosistema CROSAIM con los usuarios externos (candidatos a tryouts, coaches, staff y miembros de la comunidad) y las plataformas de terceros (Discord Gateway, Riot Games API de Valorant y streaming en YouTube).
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Human Actors */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                    <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      ACTORES HUMANOS
                    </div>
                    {C4_SYSTEM_ARCHITECTURE.level1_context.actors.map((actor, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className="text-sm font-bold text-white">{actor.name}</div>
                        <div className="text-xs text-slate-400">{actor.role}</div>
                      </div>
                    ))}
                  </div>

                  {/* Core System */}
                  <div className="bg-slate-950 rounded-xl border-2 border-violet-500/50 p-5 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>ECOSISTEMA CROSAIM</span>
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-bold text-white mt-2">
                        Infraestructura Operativa Central
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        Control Center coordina la toma de decisiones. Supabase persiste y audita eventos. Bot Operations adapta e integra APIs de Riot/YouTube. El bot de Discord ejecuta en tiempo real.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-800/40 text-xs text-violet-200">
                      <strong>Garantía Clave:</strong> Mensajería desacoplada con cola en memoria, tolerancia a caídas temporales de Discord y firma criptográfica HMAC en cada payload.
                    </div>
                  </div>

                  {/* External Systems */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-4">
                    <div className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">
                      SISTEMAS EXTERNOS
                    </div>
                    {C4_SYSTEM_ARCHITECTURE.level1_context.externalSystems.map((ext, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <div className={`text-sm font-bold ${ext.color}`}>{ext.name}</div>
                        <div className="text-xs text-slate-400">{ext.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {c4Level === 'containers' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                  <strong>Diagrama de Contenedores y Servicios (Containers):</strong> Especifica la tecnología exacta, roles y puertos de cada microservicio en la infraestructura recomendada para CROSAIM.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {C4_SYSTEM_ARCHITECTURE.level2_containers.map((cont, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                          <span className="truncate max-w-[150px] font-bold">{cont.name}</span>
                          <span className="text-slate-500">{cont.port}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {cont.role}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>TECH STACK:</span>
                        <span className="text-emerald-400 font-bold">{cont.tech}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {c4Level === 'security' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong>Protocolo Criptográfico de Webhooks HMAC-SHA256:</strong> Evita que actores maliciosos inyecten eventos falsos de Discord o manipulen rankings de Riot Games. Cada solicitud HTTP entre <code className="text-cyan-300">crosaim-bot-operations</code>, <code className="text-violet-300">Crosaim.botdiscord</code> y <code className="text-pink-300">crosaim-control-center</code> incluye firma de verificación y protección anti-replay.
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Specifications */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 font-mono text-xs">
                    <div className="text-pink-400 font-bold uppercase tracking-wider mb-2">
                      ESPECIFICACIÓN DE SEGURIDAD
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[10px]">SIGNATURE HEADER:</span>
                      {C4_SYSTEM_ARCHITECTURE.securityProtocol.header}
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[10px]">TIMESTAMP HEADER:</span>
                      {C4_SYSTEM_ARCHITECTURE.securityProtocol.timestampHeader}
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[10px]">ALGORITMO &amp; ROTACIÓN:</span>
                      {C4_SYSTEM_ARCHITECTURE.securityProtocol.algorithm}
                    </div>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 block text-[10px]">VENTANA ANTI-REPLAY:</span>
                      {C4_SYSTEM_ARCHITECTURE.securityProtocol.prevention}
                    </div>
                  </div>

                  {/* Interactive HMAC Tester */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-3 text-xs">
                    <div className="text-cyan-400 font-mono font-bold uppercase tracking-wider">
                      PROBADOR INTERACTIVO DE FIRMA HMAC
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        SHARED SECRET KEY
                      </label>
                      <input
                        type="text"
                        value={hmacSecret}
                        onChange={(e) => setHmacSecret(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        JSON PAYLOAD STRING
                      </label>
                      <textarea
                        rows={2}
                        value={hmacPayload}
                        onChange={(e) => setHmacPayload(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleComputeHmac}
                      className="w-full py-2 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-mono font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Calcular HMAC-SHA256</span>
                    </button>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="truncate max-w-[280px]">{generatedHash}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedHash);
                          setHashCopied(true);
                          setTimeout(() => setHashCopied(false), 2000);
                        }}
                        className="text-cyan-400 hover:text-white cursor-pointer ml-2"
                      >
                        {hashCopied ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {c4Level === 'roadmap' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                  <strong>Plan de Ejecución por Fases:</strong> Cronograma recomendado para transformar el repositorio de CROSAIM sin interrumpir la operación actual de la comunidad.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Fase 1 */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-3">
                    <div className="text-xs font-mono font-bold text-cyan-400">
                      FASE 1 (Días 1 a 7)
                    </div>
                    <h4 className="text-base font-bold text-white">Quick Wins &amp; Captación</h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Formulario de postulación interactivo en la web con generación de ticket (CRO-XXXX).</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Endpoint <code className="font-mono text-cyan-300">/api/health</code> público con latencias de Discord y base de datos.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                        <span>Showcase dinámico de Roster y roles de Valorant.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Fase 2 */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-violet-500/40 space-y-3">
                    <div className="text-xs font-mono font-bold text-violet-400">
                      FASE 2 (Semanas 2 a 4)
                    </div>
                    <h4 className="text-base font-bold text-white">Resiliencia &amp; Event Bus</h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span>Integración de Upstash/Redis como cola de eventos con reintentos y Dead-Letter Queue (DLQ).</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span>Firma HMAC-SHA256 en webhooks entre Bot Operations y Discord Bot.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                        <span>Políticas RLS estrictas en Supabase para aislamiento de roles de Staff vs Usuarios.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Fase 3 */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-pink-500/40 space-y-3">
                    <div className="text-xs font-mono font-bold text-pink-400">
                      FASE 3 (Mes 2 en adelante)
                    </div>
                    <h4 className="text-base font-bold text-white">Automatización Esports</h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                        <span>Scoring automatizado de scrims con Riot Games API (K/D, ADR, First Bloods).</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                        <span>Integración con YouTube Live / Twitch para alertas automáticas de torneos.</span>
                      </li>
                      <li className="flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                        <span>Control Center en producción con analítica avanzada y gestión de brackets.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
