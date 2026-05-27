import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { BotComponent } from '@/types/bot';

const component: BotComponent = {
  prefix: 'menu:select',
  async execute(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;

    const choice = interaction.values[0] ?? '';
    await interaction.update({
      content: `Vous avez choisi : **${choice}**`,
      components: [],
    });
  },
};

export default component;
