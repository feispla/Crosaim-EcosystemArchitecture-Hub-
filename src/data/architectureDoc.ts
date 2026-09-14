export interface ArchitectureItem {
  id: string;
  category: string;
  title: string;
  currentLimitation: string;
  recommendedSolution: string;
  impactLevel: 'CRÍTICO' | 'ALTO' | 'MEDIO';
  effortLevel: 'Bajo' | 'Medio' | 'Alto';
  techStack: string[];
}

export const CURRENT_LIMITATIONS_ANALYSIS: ArchitectureItem[] = [
  {
    id: 'opt-1',
    category: 'Conversión y Pipeline',
    title: 'Flujo de Reclutamiento Estático (Sin Onboarding Interactivo)',
    currentLimitation: 'La web muestra los 5 pasos (Apply, Review, Interview, Tryout, Roster) como iconos pasivos. Los jugadores no tienen forma de postularse desde la web ni rastrear su ticket.',
    recommendedSolution: 'Implementar el portal "Apply & Track": Formulario de postulación con autocompletado de Riot ID (Tracker API), generación de tracking token (ej. CRO-7821) y sincronización inmediata con canales privados de Discord.',
    impactLevel: 'CRÍTICO',
    effortLevel: 'Bajo',
    techStack: ['React Hook Form', 'Supabase Insert with RLS', 'Discord Webhook Dispatcher']
  },
  {
    id: 'opt-2',
    category: 'Observabilidad y Telemetría',
    title: 'Telemetría Falsa / Decorativa ("SYSTEM ONLINE" Hardcodeado)',
    currentLimitation: 'El indicador de estado "SYSTEM ONLINE / CORE_01" es texto plano. No refleja el estado real del Discord Gateway, la latencia de base de datos ni los reintentos de webhooks.',
    recommendedSolution: 'Healthmesh público y Telemetría de Señales: Endpoint /api/health con ping activo a Supabase, Bot Operations, Riot API y Discord Shards con métricas de uptime y RPS en tiempo real.',
    impactLevel: 'ALTO',
    effortLevel: 'Bajo',
    techStack: ['Healthcheck API', 'WebSockets / Supabase Realtime', 'Status Indicator Pill']
  },
  {
    id: 'opt-3',
    category: 'Arquitectura de Datos y Eventos',
    title: 'Acoplamiento Directo y Falta de Cola de Mensajería (Event Broker)',
    currentLimitation: 'El bot en Python (`Crosaim.botdiscord`) y `crosaim-bot-operations` se comunican de forma síncrona o mediante llamadas REST directas. Si Discord sufre rate limits (429) o micro-caídas, las señales se pierden.',
    recommendedSolution: 'Arquitectura Orientada a Eventos (EDA) con Outbox Pattern y Dead-Letter Queue (DLQ): Redis / Upstash como cola de eventos con ACK garantizado, reintentos exponenciales y firma HMAC-SHA256 para evitar falsificaciones.',
    impactLevel: 'CRÍTICO',
    effortLevel: 'Medio',
    techStack: ['Redis / BullMQ / Upstash', 'HMAC-SHA256 Signature', 'PostgreSQL Outbox Table']
  },
  {
    id: 'opt-4',
    category: 'Competición y Comunidad',
    title: 'Ausencia de Roster Activo y Live Stats de Esports',
    currentLimitation: 'La web no muestra quiénes conforman el equipo titular, sus agentes predilectos, estadísticas de K/D, ni el calendario de scrims o torneos oficiales.',
    recommendedSolution: 'Showcase Dinámico de Roster y Bracket de Torneos: Integración con Riot Games API para mostrar rango actual (Radiant/Inmortal), winrate de partidas recientes y feed del stream de YouTube/Twitch al competir.',
    impactLevel: 'ALTO',
    effortLevel: 'Medio',
    techStack: ['Riot Games Valorant API v1', 'YouTube Data API', 'Tailwind Grid Showcase']
  },
  {
    id: 'opt-5',
    category: 'Experiencia del Staff (Control Center)',
    title: 'Falta de Vista Previa / Sandbox del Control Center',
    currentLimitation: 'Los visitantes, potenciales sponsors o nuevos miembros del staff no pueden apreciar el poder del Control Center (`crosaim-control-center`), viéndolo solo como un link externo a GitHub.',
    recommendedSolution: 'Control Center Interactive Live Preview: Sandbox en la web que simula el panel de evaluación de tryouts, asignación de roles de Discord y bitácora de auditoría.',
    impactLevel: 'MEDIO',
    effortLevel: 'Bajo',
    techStack: ['Interactive Kanban', 'Audit Trail Inspector', 'RBAC Mocking']
  },
  {
    id: 'opt-6',
    category: 'Seguridad y Gobernanza',
    title: 'Falta de Especificación de Contrato de Webhooks & RLS',
    currentLimitation: 'No hay documentación explícita de los esquemas JSON intercambiados entre la capa de operaciones y el bot, lo que dificulta contribuciones de terceros o auditorías de seguridad.',
    recommendedSolution: 'Integración de OpenAPI / AsyncAPI Specs + Row Level Security (RLS) estricto en Supabase con verificación de encabezado X-Crosaim-Signature: sha256={hash} en cada webhook.',
    impactLevel: 'ALTO',
    effortLevel: 'Medio',
    techStack: ['AsyncAPI 3.0', 'Supabase RLS Policies', 'HMAC verification middleware']
  }
];

export const C4_SYSTEM_ARCHITECTURE = {
  level1_context: {
    title: 'C4 Nivel 1: Diagrama de Contexto del Sistema',
    description: 'Ilustra cómo los usuarios humanos (Candidatos, Jugadores, Staff) y los sistemas externos se relacionan con el Ecosistema CROSAIM.',
    actors: [
      { name: 'Candidato / Jugador', role: 'Aplica a tryouts, verifica su ranking y recibe asignación de rol en Discord.', icon: 'User' },
      { name: 'Staff & Coaches', role: 'Revisan aplicaciones, evalúan partidas, coordinan scrims y administran torneos desde el Control Center.', icon: 'ShieldCheck' },
      { name: 'Comunidad Discord', role: 'Interactúa con el bot, participa en eventos y recibe alertas de directos.', icon: 'Users' }
    ],
    externalSystems: [
      { name: 'Discord API & Gateway', detail: 'Gestión de roles, salas privadas de tryout y mensajería en vivo.', color: 'text-indigo-400' },
      { name: 'Riot Games API', detail: 'Extracción de MMR, rangos oficiales y registros de partidas de Valorant.', color: 'text-rose-400' },
      { name: 'YouTube / Twitch API', detail: 'Detección automática de transmisiones en vivo y alertas comunitarias.', color: 'text-red-400' }
    ]
  },
  level2_containers: [
    {
      name: 'CROSAIM Web & Hub (Este Sistema)',
      role: 'Portal público interactivo, formulario de postulación a tryouts, seguimiento de tickets, telemetría y vitrina de esports.',
      tech: 'React 19 + Tailwind CSS + Motion',
      port: '3000 / Edge'
    },
    {
      name: 'crosaim-control-center',
      role: 'Aplicación administrativa para Staff con gestión de roles RBAC, métricas de rendimiento y coordinación de torneos.',
      tech: 'React + Vite + tRPC + Tailwind',
      port: '5173 / HTTPS'
    },
    {
      name: 'crosaim-bot-operations',
      role: 'Capa adaptadora de APIs externas (Riot, YouTube, Discord webhooks) con validación de firmas HMAC y Rate Limiting.',
      tech: 'Node.js / TypeScript + Express',
      port: '8080 / REST + Webhooks'
    },
    {
      name: 'Crosaim.botdiscord',
      role: 'Servicio de ejecución en comunidad: gestión de canales de voz temporales para tryouts, bienvenida y sincronización de roles.',
      tech: 'Python 3.12 + discord.py',
      port: 'Discord Gateway Shards'
    },
    {
      name: 'Supabase Cloud (PostgreSQL + Realtime)',
      role: 'Capa de persistencia unificada con Row Level Security (RLS), triggers de auditoría y suscripciones WebSockets.',
      tech: 'PostgreSQL 16 + Realtime Engine',
      port: 'Port 5432 / HTTPS'
    },
    {
      name: 'Upstash / Redis Queue (Propuesta Clave)',
      role: 'Cola de eventos distribuida para desacoplar el bot de Discord y garantizar tolerancia a fallos y reintentos (Dead Letter Queue).',
      tech: 'Redis Streams / BullMQ',
      port: 'In-Memory Cache'
    }
  ],
  securityProtocol: {
    header: 'X-Crosaim-Signature: sha256=HMAC_DIGEST',
    timestampHeader: 'X-Crosaim-Timestamp: 1726315800',
    algorithm: 'HMAC-SHA256 con secret compartido entre capas y rotación cada 90 días',
    prevention: 'Protección contra Ataques de Replay (máximo desfase permitido: 300 segundos)'
  }
};
