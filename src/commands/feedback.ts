import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';
import { MemoryRepository } from '@/database/memoryRepository';

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

/** Repository partagé avec le handler de modal. */
export const feedbackRepository = new MemoryRepository<Feedback>();

const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Envoie un retour via un formulaire');

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder().setCustomId('feedback:submit').setTitle('Votre retour');

    const input = new TextInputBuilder()
      .setCustomId('content')
      .setLabel('Votre message')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000);

    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
  },
};

export default command;
