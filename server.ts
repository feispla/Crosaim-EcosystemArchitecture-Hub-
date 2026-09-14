import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { discordService } from './server/discordService';
import { crosaimEventBus } from './server/crosaimEventBus';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Healthcheck endpoint
  app.get('/api/health', async (req, res) => {
    const botStatus = await discordService.getBotStatus();
    res.json({
      status: 'healthy',
      system: 'CROSAIM ECOSYSTEM CORE',
      version: '2.4.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      discordBot: {
        connected: botStatus.success,
        botInfo: botStatus.bot || null,
        error: botStatus.error || null
      }
    });
  });

  // Discord Bot Status
  app.get('/api/discord/status', async (req, res) => {
    const status = await discordService.getBotStatus();
    const guildsRes = await discordService.getBotGuilds();
    res.json({
      ...status,
      applicationId: discordService.getApplicationId(),
      inviteUrl: discordService.getInviteUrl(),
      guilds: guildsRes.guilds || []
    });
  });

  // Get Discord Guilds
  app.get('/api/discord/guilds', async (req, res) => {
    const guilds = await discordService.getBotGuilds();
    res.json(guilds);
  });

  // Get Discord Channels for a Guild
  app.get('/api/discord/guilds/:guildId/channels', async (req, res) => {
    const { guildId } = req.params;
    const channels = await discordService.getGuildChannels(guildId);
    res.json(channels);
  });

  // Direct Send Embed Endpoint
  app.post('/api/discord/send-embed', async (req, res) => {
    const { channelId, webhookUrl, content, embeds } = req.body;
    if (!embeds || !Array.isArray(embeds)) {
      return res.status(400).json({ success: false, error: 'Array de embeds requerido' });
    }

    const result = await discordService.sendMessage({
      channelId,
      webhookUrl,
      content,
      embeds
    });

    res.json(result);
  });

  // CROSAIM Core Events Bus - Centralized Signal Pipeline
  // Flow: CROSAIM CORE -> EVENT / SIGNAL -> PROCESSOR -> DISCORD ADAPTER -> DISCORD
  app.get('/api/crosaim/events', (req, res) => {
    res.json({
      success: true,
      events: crosaimEventBus.getHistory()
    });
  });

  app.post('/api/crosaim/events', async (req, res) => {
    try {
      const {
        eventType,
        source,
        target,
        user,
        player,
        previousStage,
        newStage,
        payload
      } = req.body;

      if (!eventType || !player) {
        return res.status(400).json({
          success: false,
          error: 'Campos requeridos: eventType y player son obligatorios'
        });
      }

      const dispatchedEvent = await crosaimEventBus.dispatch({
        eventType,
        source: source || 'CROSAIM_CORE',
        target: target || 'DISCORD',
        user: user || 'Staff Web',
        player,
        previousStage,
        newStage,
        payload: payload || {}
      });

      res.json({
        success: true,
        event: dispatchedEvent
      });
    } catch (err: any) {
      console.error('Error procesando evento CROSAIM:', err);
      res.status(500).json({
        success: false,
        error: err.message || 'Error interno en el bus de señales'
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CROSAIM CORE] Servidor activo en http://0.0.0.0:${PORT}`);
    console.log(`[CROSAIM DISCORD] Bot Application ID: ${discordService.getApplicationId()}`);
  });
}

startServer().catch((err) => {
  console.error('Fallo crítico al iniciar servidor CROSAIM:', err);
});
