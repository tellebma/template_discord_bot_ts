/**
 * Example command using the new defineCommand approach
 * Compare this with echo.ts to see the simplification
 */
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { defineCommand } from '@/utils/defineCommand';

export default defineCommand({
  // Single source of truth for command definition
  data: new SlashCommandBuilder()
    .setName('greet')
    .setDescription('Greet a user with a custom message')
    .addUserOption(opt =>
      opt.setName('user').setDescription('The user to greet').setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName('message')
        .setDescription('Custom greeting message')
        .setMaxLength(200)
    )
    .addBooleanOption(opt =>
      opt.setName('ephemeral').setDescription('Make the response private')
    ),

  category: 'fun',
  cooldown: 3,
  // permissions: [PermissionFlagsBits.SendMessages], // Uncomment to require permission

  async execute(ctx) {
    // Type-safe option access - no need for manual casting
    const user = ctx.getUser('user', true)!;
    const message = ctx.getString('message') ?? 'Hello';
    const ephemeral = ctx.getBoolean('ephemeral') ?? false;

    await ctx.reply({
      content: `${message}, ${user}! 👋`,
      ephemeral,
    });
  },
});
