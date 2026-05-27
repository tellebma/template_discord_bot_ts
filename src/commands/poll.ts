import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';
import { MemoryRepository } from '@/database/memoryRepository';

export interface Poll {
  id: string;
  question: string;
  yes: Set<string>;
  no: Set<string>;
}

/** Repository partagé entre la commande et le handler de boutons. */
export const pollRepository = new MemoryRepository<Poll>();

export function buildPollEmbed(poll: Poll): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle('📊 Sondage')
    .setDescription(poll.question)
    .addFields(
      { name: '✅ Oui', value: String(poll.yes.size), inline: true },
      { name: '❌ Non', value: String(poll.no.size), inline: true }
    );
}

const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Crée un sondage oui/non avec des boutons')
  .addStringOption(opt =>
    opt.setName('question').setDescription('La question du sondage').setRequired(true)
  );

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const poll: Poll = { id: interaction.id, question, yes: new Set(), no: new Set() };
    await pollRepository.set(poll.id, poll);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`poll:vote:yes:${poll.id}`)
        .setLabel('Oui')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`poll:vote:no:${poll.id}`)
        .setLabel('Non')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [buildPollEmbed(poll)], components: [row] });
  },
};

export default command;
