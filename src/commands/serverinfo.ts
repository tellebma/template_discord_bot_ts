import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createStandardCommand } from '@/utils/commandTemplate';
import type { ChatInputCommandInteraction, Guild, GuildMember } from 'discord.js';

const commandData = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Get information about this server');

export default createStandardCommand({
  name: 'serverinfo',
  description: 'Get information about this server',
  category: 'utility',
  permissions: [],
  cooldown: 5,
  data: commandData,
  parameters: [],
  handler: async (
    interaction: ChatInputCommandInteraction,
    _params: Record<string, any>
  ): Promise<void> => {
    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server!',
        ephemeral: true,
      });
      return;
    }

    const guild: Guild = interaction.guild;
    const owner: GuildMember = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`Server Information - ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .setColor('#0099ff')
      .addFields(
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
        { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true }
      );

    if (guild.description) {
      embed.setDescription(guild.description);
    }

    await interaction.reply({ embeds: [embed] });
  },
});
