import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { BotComponent } from '@/types/bot';
import { componentPayload } from '@/interactions';
import { pollRepository, buildPollEmbed } from '@/commands/poll';

const component: BotComponent = {
  prefix: 'poll:vote',
  async execute(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    if (!interaction.isButton()) return;

    // customId = poll:vote:<choice>:<pollId>
    const payload = componentPayload(interaction.customId); // "<choice>:<pollId>"
    const segments = payload.split(':');
    const choice = segments[0];
    const pollId = segments[1];
    if (!pollId || (choice !== 'yes' && choice !== 'no')) return;

    const poll = await pollRepository.get(pollId);
    if (!poll) {
      await interaction.reply({ content: 'Ce sondage a expiré.', ephemeral: true });
      return;
    }

    const userId = interaction.user.id;
    // Un seul vote par utilisateur : on retire des deux camps avant d'ajouter.
    poll.yes.delete(userId);
    poll.no.delete(userId);
    if (choice === 'yes') poll.yes.add(userId);
    else poll.no.add(userId);
    await pollRepository.set(poll.id, poll);

    await interaction.update({ embeds: [buildPollEmbed(poll)] });
  },
};

export default component;
