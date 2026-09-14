import { discordService, DiscordEmbed } from './discordService';

export interface CrosaimEventPayload {
  eventId: string;
  eventType:
    | 'PLAYER_APPLICATION_CREATED'
    | 'PLAYER_APPLICATION_REVIEWED'
    | 'PLAYER_INTERVIEW_STARTED'
    | 'PLAYER_APPLICATION_APPROVED'
    | 'PLAYER_APPLICATION_REJECTED'
    | 'PLAYER_ROSTER_JOINED';
  timestamp: string;
  source: 'CROSAIM_CORE' | 'CONTROL_CENTER' | 'DISCORD_BOT' | 'BOT_OPERATIONS' | 'WEB_PORTAL';
  target: 'DISCORD' | 'SUPABASE' | 'CONTROL_CENTER' | 'ALL';
  user?: string;
  player: string;
  previousStage?: string;
  newStage?: string;
  payload: Record<string, any>;
  hmacSignature?: string;
  result?: 'SUCCESS' | 'FAILED' | 'PROCESSED';
  error?: string;
  discordResult?: {
    delivered: boolean;
    simulated?: boolean;
    channel?: string;
    messageId?: string;
    error?: string;
  };
}

export class CrosaimEventBus {
  private history: CrosaimEventPayload[] = [];
  private maxHistory: number = 100;

  constructor() {
    // Seed initial event for verification
    this.history.push({
      eventId: 'evt-init-001',
      eventType: 'PLAYER_APPLICATION_CREATED',
      timestamp: new Date().toISOString(),
      source: 'CROSAIM_CORE',
      target: 'DISCORD',
      player: 'Valkyrie#LATAM',
      previousStage: 'NONE',
      newStage: 'APPLY',
      payload: {
        riotId: 'Valkyrie',
        tagLine: 'LATAM',
        discordTag: 'valk#9921',
        rank: 'Radiant',
        role: 'Initiator',
        trackingCode: 'CRO-7821'
      },
      hmacSignature: 'sha256=39f82d1c9a0b34e567f8910a',
      result: 'SUCCESS',
      discordResult: {
        delivered: true,
        channel: '#postulaciones'
      }
    });
  }

  public getHistory(): CrosaimEventPayload[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
  }

  /**
   * Process a CROSAIM Core signal and automatically dispatch to Discord
   */
  public async dispatch(eventData: Omit<CrosaimEventPayload, 'eventId' | 'timestamp' | 'hmacSignature' | 'result' | 'discordResult'>): Promise<CrosaimEventPayload> {
    const eventId = `evt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    // Compute simulated/real HMAC-SHA256
    const signatureStr = `${eventId}:${eventData.eventType}:${eventData.player}:${timestamp}`;
    let hash = 0;
    for (let i = 0; i < signatureStr.length; i++) {
      hash = (hash << 5) - hash + signatureStr.charCodeAt(i);
      hash |= 0;
    }
    const hmacSignature = `sha256=${Math.abs(hash).toString(16).padStart(16, '0')}${Math.abs(hash * 37).toString(16).padStart(16, '0')}`;

    let discordEmbed: DiscordEmbed | null = null;
    let targetChannel = eventData.payload.discordChannelId;

    // Build matching Discord embed based on official state
    switch (eventData.eventType) {
      case 'PLAYER_APPLICATION_CREATED':
        discordEmbed = discordService.buildPostulacionEmbed({
          name: eventData.payload.name || eventData.player,
          riotId: eventData.payload.riotId || eventData.player.split('#')[0] || eventData.player,
          tagLine: eventData.payload.tagLine || eventData.player.split('#')[1] || 'LATAM',
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          role: eventData.payload.role || 'Duelist',
          rank: eventData.payload.rank || 'Ascendant 1',
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX',
          submittedAt: timestamp
        });
        break;

      case 'PLAYER_APPLICATION_REVIEWED':
        discordEmbed = discordService.buildRevisionEmbed({
          riotId: eventData.payload.riotId || eventData.player.split('#')[0] || eventData.player,
          tagLine: eventData.payload.tagLine || eventData.player.split('#')[1] || 'LATAM',
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          rank: eventData.payload.rank || 'Ascendant 1',
          role: eventData.payload.role || 'Duelist',
          scrimKDA: eventData.payload.scrimKDA,
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX',
          reviewer: eventData.user || 'Head Coach Feispla'
        });
        break;

      case 'PLAYER_INTERVIEW_STARTED':
        discordEmbed = discordService.buildEntrevistaEmbed({
          player: eventData.player,
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          interviewer: eventData.payload.interviewer || eventData.user || 'Coach Feispla',
          channel: eventData.payload.channel || '🔊 Sala de Voz Tryouts #1',
          scheduledTime: eventData.payload.scheduledTime || 'Hoy - 20:00 UTC',
          role: eventData.payload.role || 'Flex',
          rank: eventData.payload.rank || 'Immortal 1',
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX',
          notes: eventData.payload.notes
        });
        break;

      case 'PLAYER_APPLICATION_APPROVED':
        discordEmbed = discordService.buildAprobadaEmbed({
          player: eventData.player,
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          rank: eventData.payload.rank || 'Immortal 1',
          role: eventData.payload.role || 'Flex',
          teamTarget: eventData.payload.teamTarget || 'Main Roster',
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX'
        });
        break;

      case 'PLAYER_APPLICATION_REJECTED':
        discordEmbed = discordService.buildRechazadaEmbed({
          player: eventData.player,
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          role: eventData.payload.role || 'Flex',
          reason: eventData.payload.reason,
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX'
        });
        break;

      case 'PLAYER_ROSTER_JOINED':
        discordEmbed = discordService.buildRosterWelcomeEmbed({
          playerName: eventData.payload.playerName || eventData.player,
          riotId: eventData.payload.riotId || eventData.player.split('#')[0] || eventData.player,
          tagLine: eventData.payload.tagLine || eventData.player.split('#')[1] || 'LATAM',
          discordTag: eventData.payload.discordTag || 'unknown#0000',
          role: eventData.payload.role || 'Duelist',
          rank: eventData.payload.rank || 'Radiant',
          team: eventData.payload.team || 'Main Roster',
          assignedRoleTag: eventData.payload.assignedRoleTag,
          trackingCode: eventData.payload.trackingCode || 'CRO-XXXX'
        });
        break;
    }

    let discordResult: CrosaimEventPayload['discordResult'] = {
      delivered: false
    };

    if (discordEmbed) {
      try {
        const sendRes = await discordService.sendMessage({
          channelId: targetChannel,
          webhookUrl: eventData.payload.webhookUrl,
          embeds: [discordEmbed]
        });

        discordResult = {
          delivered: sendRes.success,
          simulated: sendRes.simulated,
          channel: sendRes.targetChannel,
          messageId: sendRes.messageId,
          error: sendRes.error
        };
      } catch (err: any) {
        discordResult = {
          delivered: false,
          error: err.message
        };
      }
    }

    const fullEvent: CrosaimEventPayload = {
      ...eventData,
      eventId,
      timestamp,
      hmacSignature,
      result: discordResult.delivered ? 'SUCCESS' : 'PROCESSED',
      discordResult
    };

    this.history.unshift(fullEvent);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    return fullEvent;
  }
}

export const crosaimEventBus = new CrosaimEventBus();
