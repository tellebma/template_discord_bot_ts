import { Interaction, ChatInputCommandInteraction } from 'discord.js';
import type { ExtendedClient } from '@/types/bot';
import { Logger, ErrorHandler } from '@/utils';
import { resolveComponent } from '@/interactions';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction): Promise<void> {
    const client = interaction.client as ExtendedClient;

    try {
      // 1. Autocomplete
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          await command.autocomplete(interaction);
        }
        return;
      }

      // 2. Slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          Logger.warn('Command not found', { commandName: interaction.commandName });
          return;
        }
        Logger.info('Command received', {
          command: interaction.commandName,
          user: interaction.user.tag,
          guild: interaction.guild?.name ?? 'DM',
        });
        await command.execute(interaction);
        return;
      }

      // 3. Composants (boutons, select menus, modals)
      if (
        interaction.isButton() ||
        interaction.isAnySelectMenu() ||
        interaction.isModalSubmit()
      ) {
        const component = resolveComponent(client.components, interaction.customId);
        if (!component) {
          Logger.warn('Component handler not found', { customId: interaction.customId });
          return;
        }
        Logger.info('Component received', {
          customId: interaction.customId,
          user: interaction.user.tag,
        });
        await component.execute(interaction);
        return;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // handleInteractionError only accepts ChatInputCommandInteraction; use it
      // for slash commands and fall back to handle() + manual reply for others.
      if (interaction.isChatInputCommand()) {
        await ErrorHandler.handleInteractionError(
          err,
          interaction as ChatInputCommandInteraction
        );
      } else {
        await ErrorHandler.handle(err);
        if (interaction.isRepliable()) {
          try {
            const replyOptions = {
              content: 'An error occurred while processing your request.',
              ephemeral: true,
            };
            if (interaction.replied || interaction.deferred) {
              await interaction.followUp(replyOptions);
            } else {
              await interaction.reply(replyOptions);
            }
          } catch (replyError) {
            Logger.error('Failed to send error response to user', {
              originalError: err.message,
              replyError:
                replyError instanceof Error ? replyError.message : String(replyError),
            });
          }
        }
      }
    }
  },
};
