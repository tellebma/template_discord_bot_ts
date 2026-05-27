import { CronJob } from 'cron';
import type { Client } from 'discord.js';
import { Logger } from '@/utils';

/**
 * Example cron job — runs every 30 minutes.
 *
 * Replace the body of `execute` with your own logic.
 * You have access to the Discord client to send messages, update presence, etc.
 *
 * Cron syntax: second minute hour dayOfMonth month dayOfWeek
 * Examples:
 *   '0 *\/5 * * * *'  — every 5 minutes
 *   '0 0 * * * *'     — every hour
 *   '0 0 9 * * *'     — every day at 9:00
 *   '0 0 0 * * 1'     — every Monday at midnight
 */
export default {
  name: 'example',
  schedule: '0 */30 * * * *',
  execute(client: Client): CronJob {
    return new CronJob(this.schedule, () => {
      Logger.info('Example cron executed', {
        guilds: client.guilds.cache.size,
      });
    });
  },
};
