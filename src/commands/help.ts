import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  MessageFlags,
} from 'discord.js';
import type { ExtendedClient, BotCommand } from '@/types/bot';
import { infoEmbed } from '@/utils';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Affiche la liste des commandes ou le détail de l\'une d\'elles')
  .addStringOption(opt =>
    opt
      .setName('commande')
      .setDescription('Nom d\'une commande pour voir son détail')
      .setAutocomplete(true)
  );

const command: BotCommand = {
  data,

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const client = interaction.client as ExtendedClient;
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = [...client.commands.values()]
      .map(cmd => cmd.data.name)
      .filter(name => name.startsWith(focused))
      .slice(0, 25)
      .map(name => ({ name, value: name }));
    await interaction.respond(choices);
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client as ExtendedClient;
    const target = interaction.options.getString('commande');

    if (target) {
      const cmd = client.commands.get(target);
      if (!cmd) {
        await interaction.reply({
          content: `Commande inconnue : \`${target}\``,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const embed = infoEmbed(`/${cmd.data.name}`, cmd.data.description).addFields({
        name: 'Autocomplete',
        value: cmd.autocomplete ? 'Oui' : 'Non',
        inline: true,
      });
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const list = [...client.commands.values()]
      .map(cmd => `**/${cmd.data.name}** — ${cmd.data.description}`)
      .join('\n');
    const embed = infoEmbed('📖 Commandes disponibles', list || 'Aucune commande.');
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
