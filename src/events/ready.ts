import type { Client } from 'discord.js';
import { Logger } from '@/utils';

export default {
  name: 'ready',
  once: true,
  execute(client: Client): void {
    Logger.info('Bot is online and ready', {
      tag: client.user?.tag,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
    });

    client.user?.setActivity('with TypeScript', { type: 0 }); // PLAYING type
  },
};
