import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';

const data = new SlashCommandBuilder()
  .setName('menu')
  .setDescription("Démonstration d'un menu de sélection");

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu:select')
      .setPlaceholder('Choisissez votre couleur préférée')
      .addOptions(
        { label: 'Rouge', value: 'rouge', emoji: '🔴' },
        { label: 'Vert', value: 'vert', emoji: '🟢' },
        { label: 'Bleu', value: 'bleu', emoji: '🔵' }
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    await interaction.reply({
      content: 'Sélectionnez une option :',
      components: [row],
      ephemeral: true,
    });
  },
};

export default command;
