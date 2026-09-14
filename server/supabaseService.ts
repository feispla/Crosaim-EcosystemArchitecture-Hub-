import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasServiceRoleKey: boolean;
  supabaseUrl: string | null;
}

export class SupabaseAdminService {
  private client: SupabaseClient | null = null;
  private initializationAttempted = false;

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
      if (!this.initializationAttempted) {
        console.info(
          '[Supabase Admin Service] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados. Las operaciones con Supabase permanecerán en modo offline/simulado.'
        );
        this.initializationAttempted = true;
      }
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
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados en el entorno del servidor.'
      };
    }

    const start = Date.now();
    try {
      // Light health query to verify credentials and connectivity
      const { error } = await client.from('crosaim_audit_logs').select('id').limit(1);
      const latencyMs = Date.now() - start;

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        // 42P01 means table does not exist yet, which still confirms valid authentication and connection
        return {
          success: false,
          message: `Error de consulta en Supabase: ${error.message} (Código: ${error.code})`,
          latencyMs
        };
      }

      return {
        success: true,
        message: 'Conexión a Supabase autenticada exitosamente con Service Role Key.',
        latencyMs
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
   * Persists an audit log event to Supabase
   */
  public async logEvent(event: {
    eventType: string;
    source: string;
    target: string;
    payload: any;
    user?: string;
  }): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

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
        // If table doesn't exist yet, we report without crashing
        console.warn('[Supabase Audit Log Notice]', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Log Exception]', err);
      return false;
    }
  }
}

export const supabaseAdminService = new SupabaseAdminService();
