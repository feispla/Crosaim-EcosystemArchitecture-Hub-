export type LayerId = 'control' | 'bot' | 'ops';

export interface EcosystemLayer {
  id: LayerId;
  index: string;
  eyebrow: string;
  name: string;
  description: string;
  tech: string[];
  repo: string;
  accent: 'cyan' | 'violet' | 'pink';
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  latencyMs: number;
  activeWorkers: number;
}

export interface SignalEvent {
  id: string;
  timestamp: string;
  source: 'CROSAIM_CORE' | 'CONTROL_CENTER' | 'DISCORD_BOT' | 'BOT_OPERATIONS' | 'SUPABASE' | 'RIOT_API' | 'WEB_PORTAL';
  target: 'CROSAIM_CORE' | 'CONTROL_CENTER' | 'DISCORD_BOT' | 'BOT_OPERATIONS' | 'SUPABASE' | 'DISCORD';
  eventType:
    | 'PLAYER_APPLICATION_CREATED'
    | 'PLAYER_APPLICATION_REVIEWED'
    | 'PLAYER_INTERVIEW_STARTED'
    | 'PLAYER_APPLICATION_APPROVED'
    | 'PLAYER_APPLICATION_REJECTED'
    | 'PLAYER_ROSTER_JOINED'
    | 'USER_APPLY_SUBMITTED'
    | 'TRYOUT_SCHEDULED'
    | 'RIOT_RANK_VERIFIED'
    | 'DISCORD_ROLE_ASSIGNED'
    | 'MATCH_SCRIM_LOGGED'
    | 'HMAC_HEARTBEAT';
  payload: Record<string, any>;
  hmacSignature: string;
  ackStatus: 'ACK_CONFIRMED' | 'PROCESSING' | 'FAILED';
  discordDelivery?: {
    delivered: boolean;
    simulated?: boolean;
    channel?: string;
    messageId?: string;
    error?: string;
  };
}

export interface DiscordBotState {
  connected: boolean;
  applicationId: string;
  inviteUrl: string;
  bot?: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  guilds?: Array<{
    id: string;
    name: string;
    icon: string | null;
  }>;
  error?: string;
}

export interface InterviewSession {
  candidateId: string;
  player: string;
  discordTag: string;
  interviewer: string;
  voiceChannel: string;
  scheduledTime: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface CandidateApplication {
  id: string;
  trackingCode: string;
  riotId: string;
  tagLine: string;
  discordTag: string;
  role: 'Duelist' | 'Initiator' | 'Controller' | 'Sentinel' | 'Head Coach' | 'Analyst';
  rank:
    | 'Radiant'
    | 'Immortal 3'
    | 'Immortal 2'
    | 'Immortal 1'
    | 'Ascendant 3'
    | 'Ascendant 2'
    | 'Ascendant 1'
    | 'Diamond 3'
    | 'Diamond 2'
    | 'Diamond 1'
    | 'Platinum 3'
    | 'Platinum 2'
    | 'Platinum 1'
    | 'Gold 3'
    | 'Gold 2'
    | 'Gold 1'
    | 'Silver 3'
    | 'Silver 2'
    | 'Silver 1'
    | 'Bronze 3'
    | 'Bronze 2'
    | 'Bronze 1';
  stage: 'APPLY' | 'REVIEW' | 'INTERVIEW' | 'TRYOUT' | 'ROSTER';
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  scrimKDA: string;
  ratingScore: number;
  submittedAt: string;
  assignedInterviewer?: string;
  notes?: string;
}

export interface PlayerRoster {
  id: string;
  name: string;
  handle: string;
  role: string;
  team: 'Main Roster' | 'Academy Team';
  avatar: string;
  preferredAgents: string[];
  kda: string;
  winRate: string;
  rank: string;
  status: 'Active' | 'Starter' | 'Substitute';
}

export interface TelemetryNode {
  name: string;
  layer: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  rps: number;
  uptime: string;
}

export interface DiscordOAuthUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string;
  avatarUrl: string;
  role: string;
  authenticatedAt: string;
}
