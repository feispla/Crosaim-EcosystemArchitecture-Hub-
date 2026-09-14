import { EcosystemLayer, SignalEvent, CandidateApplication, PlayerRoster, TelemetryNode } from '../types';

export const ECOSYSTEM_LAYERS: EcosystemLayer[] = [
  {
    id: 'control',
    index: '01',
    eyebrow: 'THE COMMAND LAYER',
    name: 'Control Center',
    description: 'El centro operativo de CROSAIM para organizar jugadores, equipos, torneos, contenido, calendario y analítica desde una sola vista unificada.',
    tech: ['React / Vite', 'RBAC Security', 'tRPC API', 'Realtime Analytics', 'PostgreSQL Sync'],
    repo: 'https://github.com/feispla/crosaim-control-center',
    accent: 'cyan',
    status: 'ONLINE',
    latencyMs: 38,
    activeWorkers: 4
  },
  {
    id: 'bot',
    index: '02',
    eyebrow: 'THE COMMUNITY LAYER',
    name: 'Discord Bot',
    description: 'Automatiza el recorrido competitivo dentro de la comunidad: recepción de solicitudes, entrevistas por voz, tryouts en scrims y notificaciones en canales privados.',
    tech: ['Python 3.12', 'discord.py', 'Supabase Client', 'HMAC Verification', 'Audit Log'],
    repo: 'https://github.com/feispla/Crosaim.botdiscord',
    accent: 'violet',
    status: 'ONLINE',
    latencyMs: 44,
    activeWorkers: 6
  },
  {
    id: 'ops',
    index: '03',
    eyebrow: 'THE ADAPTER LAYER',
    name: 'Bot Operations',
    description: 'La capa de interoperabilidad y middleware para transformar señales entre Discord, YouTube Broadcast, Riot Games API y la base de datos central.',
    tech: ['TypeScript', 'Express / Fastify', 'Riot Games API', 'Webhook Dispatcher', 'Rate Limiter'],
    repo: 'https://github.com/feispla/crosaim-bot-operations',
    accent: 'pink',
    status: 'ONLINE',
    latencyMs: 27,
    activeWorkers: 3
  }
];

export const INITIAL_SIGNALS: SignalEvent[] = [
  {
    id: 'sig-9021',
    timestamp: '13:04:12',
    source: 'DISCORD_BOT',
    target: 'SUPABASE',
    eventType: 'USER_APPLY_SUBMITTED',
    payload: { applicant: 'Valkyrie#LATAM', role: 'Duelist', rank: 'Immortal 3', discordId: '3948291049281' },
    hmacSignature: 'sha256=9b7f14b8a2e1d09c8e192f16a04bfbc59302',
    ackStatus: 'ACK_CONFIRMED'
  },
  {
    id: 'sig-9022',
    timestamp: '13:05:40',
    source: 'BOT_OPERATIONS',
    target: 'CONTROL_CENTER',
    eventType: 'RIOT_RANK_VERIFIED',
    payload: { riotId: 'Valkyrie#LATAM', mmr: 812, peak: 'Radiant #340', winRate: '68.4%' },
    hmacSignature: 'sha256=148fa734b029c0182ecbf81403bf67a01298',
    ackStatus: 'ACK_CONFIRMED'
  },
  {
    id: 'sig-9023',
    timestamp: '13:07:05',
    source: 'CONTROL_CENTER',
    target: 'DISCORD_BOT',
    eventType: 'TRYOUT_SCHEDULED',
    payload: { candidateId: 'Valkyrie#LATAM', roomChannel: '#tryout-scrim-a', timeSlot: '19:00 UTC' },
    hmacSignature: 'sha256=e91a0c4f8205bd3982f1ac8e74bc0281b671',
    ackStatus: 'ACK_CONFIRMED'
  },
  {
    id: 'sig-9024',
    timestamp: '13:08:22',
    source: 'DISCORD_BOT',
    target: 'CONTROL_CENTER',
    eventType: 'DISCORD_ROLE_ASSIGNED',
    payload: { member: 'Valkyrie#LATAM', roleAdded: '@Tryout-Candidate', guildId: '981273910283' },
    hmacSignature: 'sha256=a8721bf09c31fa765b21008cb672f1092e01',
    ackStatus: 'ACK_CONFIRMED'
  }
];

export const INITIAL_CANDIDATES: CandidateApplication[] = [
  {
    id: 'app-01',
    trackingCode: 'CRO-7821',
    riotId: 'Valkyrie',
    tagLine: 'LATAM',
    discordTag: 'valk_esports#0001',
    role: 'Duelist',
    rank: 'Radiant',
    stage: 'TRYOUT',
    status: 'in-review',
    scrimKDA: '1.42 K/D',
    ratingScore: 94,
    submittedAt: 'Hace 2 horas',
    assignedInterviewer: 'Coach Feispla',
    notes: 'Excelente entry frag en Split y Haven. Gran comunicación en rounds eco.'
  },
  {
    id: 'app-02',
    trackingCode: 'CRO-7822',
    riotId: 'Specter',
    tagLine: 'ARG',
    discordTag: 'specter_fps#8291',
    role: 'Initiator',
    rank: 'Immortal 3',
    stage: 'INTERVIEW',
    status: 'pending',
    scrimKDA: '1.18 K/D',
    ratingScore: 89,
    submittedAt: 'Hace 5 horas',
    assignedInterviewer: 'Staff Raven',
    notes: 'Lineups de Sova y Fade muy consistentes. Pendiente confirmación de horario.'
  },
  {
    id: 'app-03',
    trackingCode: 'CRO-7823',
    riotId: 'Nexus',
    tagLine: 'CHL',
    discordTag: 'nexus_smoke#4412',
    role: 'Controller',
    rank: 'Immortal 2',
    stage: 'REVIEW',
    status: 'in-review',
    scrimKDA: '1.09 K/D',
    ratingScore: 86,
    submittedAt: 'Ayer a las 21:30',
    assignedInterviewer: 'Capitán Zeth',
    notes: 'Omen / Astra specialist. Experiencia en torneos universitarios.'
  },
  {
    id: 'app-04',
    trackingCode: 'CRO-7824',
    riotId: 'SentinelZero',
    tagLine: 'MEX',
    discordTag: 'zero_cypher#9920',
    role: 'Sentinel',
    rank: 'Radiant',
    stage: 'ROSTER',
    status: 'approved',
    scrimKDA: '1.31 K/D',
    ratingScore: 97,
    submittedAt: 'Hace 3 días',
    assignedInterviewer: 'Coach Feispla',
    notes: 'Promovido oficialmente al Academy Team. Rol @Academy-Starter en Discord asignado.'
  },
  {
    id: 'app-05',
    trackingCode: 'CRO-7825',
    riotId: 'SparkyAim',
    tagLine: 'COL',
    discordTag: 'sparky#5512',
    role: 'Duelist',
    rank: 'Bronze 3',
    stage: 'APPLY',
    status: 'pending',
    scrimKDA: '1.05 K/D',
    ratingScore: 78,
    submittedAt: 'Hace 45 min',
    assignedInterviewer: 'Staff de Operaciones',
    notes: 'Aspirante para la liga comunitaria de iniciación y desarrollo Academy.'
  }
];

export const INITIAL_ROSTER: PlayerRoster[] = [
  {
    id: 'p-1',
    name: 'Lucas Morales',
    handle: 'KAZER',
    role: 'Duelist / Entry',
    team: 'Main Roster',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    preferredAgents: ['Jett', 'Raze', 'Yoru'],
    kda: '1.38',
    winRate: '72%',
    rank: 'Radiant #48',
    status: 'Starter'
  },
  {
    id: 'p-2',
    name: 'Mateo Rivas',
    handle: 'ZEPHYR',
    role: 'Initiator / IGL',
    team: 'Main Roster',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    preferredAgents: ['Sova', 'Fade', 'Breach'],
    kda: '1.19',
    winRate: '69%',
    rank: 'Radiant #112',
    status: 'Starter'
  },
  {
    id: 'p-3',
    name: 'Sebastián Silva',
    handle: 'SHADOW',
    role: 'Controller',
    team: 'Main Roster',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    preferredAgents: ['Omen', 'Viper', 'Astra'],
    kda: '1.14',
    winRate: '70%',
    rank: 'Immortal 3',
    status: 'Starter'
  },
  {
    id: 'p-4',
    name: 'Alejandro Cruz',
    handle: 'AEGIS',
    role: 'Sentinel / Anchor',
    team: 'Main Roster',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    preferredAgents: ['Killjoy', 'Cypher', 'Deadlock'],
    kda: '1.22',
    winRate: '74%',
    rank: 'Radiant #89',
    status: 'Starter'
  },
  {
    id: 'p-5',
    name: 'Diego Peña',
    handle: 'SENTINELZERO',
    role: 'Flex / Initiator',
    team: 'Academy Team',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    preferredAgents: ['Gekko', 'KAY/O', 'Skye'],
    kda: '1.28',
    winRate: '65%',
    rank: 'Immortal 3',
    status: 'Starter'
  }
];

export const TELEMETRY_NODES: TelemetryNode[] = [
  { name: 'Control Center Gateway', layer: 'Core UI & tRPC', status: 'healthy', latency: 32, rps: 180, uptime: '99.98%' },
  { name: 'Supabase Realtime Sync', layer: 'Database & Event Store', status: 'healthy', latency: 19, rps: 420, uptime: '99.99%' },
  { name: 'Discord Bot Gateway', layer: 'Community Worker', status: 'healthy', latency: 45, rps: 210, uptime: '99.94%' },
  { name: 'Bot Operations Adapter', layer: 'Integrations & Webhooks', status: 'healthy', latency: 26, rps: 340, uptime: '99.95%' },
  { name: 'Riot Games Valorant API', layer: 'External Match Auth', status: 'healthy', latency: 68, rps: 95, uptime: '99.82%' }
];
