import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { createStandardCommand } from '@/utils/commandTemplate';
import type { ChatInputCommandInteraction, GuildMember, User } from 'discord.js';

const commandData = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Get information about a user')
  .addUserOption(option =>
    option.setName('target').setDescription('The user to get information about').setRequired(false)
  );

export default createStandardCommand({
  name: 'userinfo',
  description: 'Get information about a user',
  category: 'utility',
  permissions: [],
  cooldown: 3,
  data: commandData,
  parameters: [
    {
      type: 'user',
      name: 'target',
      description: 'The user to get information about',
      required: false,
    },
  ],
  handler: async (
    interaction: ChatInputCommandInteraction,
    params: Record<string, unknown>
  ): Promise<void> => {
    const targetUser: User = (params['target'] as User) || interaction.user;
    const member: GuildMember | null = interaction.guild?.members.cache.get(targetUser.id) ?? null;

    const embed = new EmbedBuilder()
      .setTitle(`User Information - ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .setColor(member?.displayHexColor ?? '#0099ff')
      .addFields(
        { name: 'Username', value: targetUser.tag, inline: true },
        { name: 'User ID', value: targetUser.id, inline: true },
        {
          name: 'Account Created',
          value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
          inline: false,
        }
      );

    if (member) {
      const roles =
        member.roles.cache
          .filter(role => role.name !== '@everyone')
          .map(role => role.toString())
          .join(', ') || 'None';

      embed.addFields(
        {
          name: 'Joined Server',
          value: `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:F>`,
          inline: false,
        },
        { name: 'Roles', value: roles, inline: false }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
});
