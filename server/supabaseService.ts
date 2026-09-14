import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  supabaseUrl: string | null;
  tablesStatus?: {
    candidatesTable: boolean;
    rosterTable: boolean;
    auditLogsTable: boolean;
  };
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), 'crosaim_real_store.json');

interface LocalStoreSchema {
  candidates: any[];
  roster: any[];
  events: any[];
}

function loadLocalStore(): LocalStoreSchema {
  try {
    if (fs.existsSync(LOCAL_STORAGE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORAGE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Local Store] Error al leer archivo de respaldo local:', err);
  }
  return { candidates: [], roster: [], events: [] };
}

function saveLocalStore(data: LocalStoreSchema) {
  try {
    fs.writeFileSync(LOCAL_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Local Store] Error al guardar archivo de respaldo local:', err);
  }
}

export class SupabaseAdminService {
  private client: SupabaseClient | null = null;
  private localStore: LocalStoreSchema = loadLocalStore();

  /**
   * Lazily initializes and returns the Supabase admin client using SUPABASE_SERVICE_ROLE_KEY.
   * Service Role Key bypasses Row Level Security (RLS) for server-side trusted operations.
   */
  public getClient(): SupabaseClient | null {
    if (this.client) {
      return this.client;
    }

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return null;
    }

    try {
      this.client = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      console.log(`[Supabase Admin Service] Cliente inicializado correctamente con Service Role Key para: ${supabaseUrl}`);
      return this.client;
    } catch (err) {
      console.error('[Supabase Admin Service Error al inicializar]', err);
      return null;
    }
  }

  /**
   * Returns current configuration status without exposing the actual service role key
   */
  public getStatus(): SupabaseConfigStatus {
    const supabaseUrl = process.env.SUPABASE_URL?.trim() || null;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    return {
      isConfigured: !!(supabaseUrl && hasServiceRoleKey),
      hasUrl: !!supabaseUrl,
      hasServiceRoleKey,
      supabaseUrl: supabaseUrl ? supabaseUrl.replace(/^(https?:\/\/[^/]+).*$/, '$1') : null
    };
  }

  /**
   * Tests Supabase connectivity using the Service Role Key
   */
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    tablesDetected?: boolean;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados en el servidor.'
      };
    }

    const start = Date.now();
    try {
      // Light health query against public schema
      const { error } = await client.from('crosaim_audit_logs').select('id').limit(1);
      const latencyMs = Date.now() - start;

      // Codes PGRST205 (table not found in cache) and 42P01 (relation does not exist) confirm authenticated access
      if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
        return {
          success: false,
          message: `Error de autenticación o consulta en Supabase: ${error.message} (Código: ${error.code})`,
          latencyMs
        };
      }

      const tablesDetected = !error;
      return {
        success: true,
        message: tablesDetected
          ? 'Conexión a Supabase activa y tablas de CROSAIM verificadas.'
          : 'Conexión a Supabase autenticada exitosamente con Service Role Key. Tablas listas para inicializar.',
        latencyMs,
        tablesDetected
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Fallo de conexión a Supabase: ${err.message}`,
        latencyMs: Date.now() - start
      };
    }
  }

  /**
   * Fetch real candidates from Supabase, falling back to real local store
   */
  public async getCandidates(): Promise<any[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('crosaim_candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(row => ({
            id: row.id,
            riotId: row.riot_id,
            tagLine: row.tag_line,
            discordTag: row.discord_tag,
            role: row.role,
            rank: row.rank,
            stage: row.stage,
            status: row.status,
            trackingCode: row.tracking_code,
            scrimKDA: row.scrim_kda,
            winRate: row.win_rate,
            notes: row.notes,
            assignedInterviewer: row.assigned_interviewer,
            submittedAt: row.created_at
          }));
        }
      } catch {
        // Fallback to local store
      }
    }
    return this.localStore.candidates;
  }

  /**
   * Save or update a candidate in Supabase and local store
   */
  public async saveCandidate(candidate: any): Promise<boolean> {
    // 1. Update in-memory & file store
    const existingIndex = this.localStore.candidates.findIndex(c => c.id === candidate.id || c.trackingCode === candidate.trackingCode);
    if (existingIndex >= 0) {
      this.localStore.candidates[existingIndex] = { ...this.localStore.candidates[existingIndex], ...candidate };
    } else {
      this.localStore.candidates.unshift(candidate);
    }
    saveLocalStore(this.localStore);

    // 2. Persist to Supabase if available
    const client = this.getClient();
    if (!client) return true;

    try {
      const payload = {
        id: candidate.id,
        riot_id: candidate.riotId,
        tag_line: candidate.tagLine,
        discord_tag: candidate.discordTag,
        role: candidate.role,
        rank: candidate.rank,
        stage: candidate.stage,
        status: candidate.status,
        tracking_code: candidate.trackingCode,
        scrim_kda: candidate.scrimKDA || null,
        win_rate: candidate.winRate || null,
        notes: candidate.notes || null,
        assigned_interviewer: candidate.assignedInterviewer || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await client
        .from('crosaim_candidates')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase Candidate Sync Notice]', error.message);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Candidate Exception]', err);
      return true;
    }
  }

  /**
   * Fetch real roster from Supabase or local store
   */
  public async getRoster(): Promise<any[]> {
    const client = this.getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('crosaim_roster')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(row => ({
            id: row.id,
            name: row.name,
            handle: row.handle,
            role: row.role,
            team: row.team,
            avatar: row.avatar,
            preferredAgents: row.preferred_agents || [],
            kda: row.kda,
            winRate: row.win_rate,
            rank: row.rank,
            status: row.status
          }));
        }
      } catch {
        // Fallback to local store
      }
    }
    return this.localStore.roster;
  }

  /**
   * Save roster member
   */
  public async saveRosterMember(player: any): Promise<boolean> {
    const existingIndex = this.localStore.roster.findIndex(p => p.id === player.id || p.handle === player.handle);
    if (existingIndex >= 0) {
      this.localStore.roster[existingIndex] = { ...this.localStore.roster[existingIndex], ...player };
    } else {
      this.localStore.roster.unshift(player);
    }
    saveLocalStore(this.localStore);

    const client = this.getClient();
    if (!client) return true;

    try {
      const payload = {
        id: player.id,
        name: player.name,
        handle: player.handle,
        role: player.role,
        team: player.team,
        avatar: player.avatar,
        preferred_agents: player.preferredAgents || [],
        kda: player.kda,
        win_rate: player.winRate,
        rank: player.rank,
        status: player.status,
        created_at: new Date().toISOString()
      };

      const { error } = await client
        .from('crosaim_roster')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[Supabase Roster Sync Notice]', error.message);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Roster Exception]', err);
      return true;
    }
  }

  /**
   * Persists an audit log event to Supabase and local store
   */
  public async logEvent(event: {
    eventType: string;
    source: string;
    target: string;
    payload: any;
    user?: string;
  }): Promise<boolean> {
    this.localStore.events.unshift({
      id: `evt-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
      ...event,
      timestamp: new Date().toISOString()
    });
    if (this.localStore.events.length > 100) {
      this.localStore.events = this.localStore.events.slice(0, 100);
    }
    saveLocalStore(this.localStore);

    const client = this.getClient();
    if (!client) return true;

    try {
      const { error } = await client.from('crosaim_audit_logs').insert({
        event_type: event.eventType,
        source: event.source,
        target: event.target,
        payload: event.payload,
        user_identifier: event.user || 'SYSTEM',
        created_at: new Date().toISOString()
      });

      if (error) {
        console.warn('[Supabase Audit Log Notice]', error.message);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Log Exception]', err);
      return false;
    }
  }

  /**
   * SQL Migration script for Supabase SQL Editor
   */
  public getSqlMigrationScript(): string {
    return `-- CROSAIM ECOSYSTEM SCHEMA FOR SUPABASE
-- Execute in Supabase Dashboard > SQL Editor to enable persistent PostgreSQL storage

CREATE TABLE IF NOT EXISTS public.crosaim_candidates (
  id TEXT PRIMARY KEY,
  riot_id TEXT NOT NULL,
  tag_line TEXT NOT NULL,
  discord_tag TEXT NOT NULL,
  role TEXT NOT NULL,
  rank TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'APPLY',
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_code TEXT NOT NULL UNIQUE,
  scrim_kda TEXT,
  win_rate TEXT,
  notes TEXT,
  assigned_interviewer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crosaim_roster (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  role TEXT NOT NULL,
  team TEXT NOT NULL,
  avatar TEXT,
  preferred_agents TEXT[],
  kda TEXT,
  win_rate TEXT,
  rank TEXT,
  status TEXT DEFAULT 'Starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crosaim_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  payload JSONB,
  user_identifier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.crosaim_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crosaim_roster ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crosaim_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read, service_role full access
CREATE POLICY "Public read candidates" ON public.crosaim_candidates FOR SELECT USING (true);
CREATE POLICY "Public read roster" ON public.crosaim_roster FOR SELECT USING (true);
CREATE POLICY "Public read audit logs" ON public.crosaim_audit_logs FOR SELECT USING (true);
`;
  }
}

export const supabaseAdminService = new SupabaseAdminService();
