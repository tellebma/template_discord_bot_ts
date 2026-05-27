import { MessageComponentInteraction, ModalSubmitInteraction, MessageFlags } from 'discord.js';
import type { BotComponent } from '@/types/bot';
import { successEmbed } from '@/utils';
import { feedbackRepository, type Feedback } from '@/commands/feedback';

const component: BotComponent = {
  prefix: 'feedback:submit',
  async execute(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    if (!interaction.isModalSubmit()) return;

    const content = interaction.fields.getTextInputValue('content');
    const feedback: Feedback = {
      id: interaction.id,
      userId: interaction.user.id,
      content,
      createdAt: new Date().toISOString(),
    };
    await feedbackRepository.set(feedback.id, feedback);

    await interaction.reply({
      embeds: [successEmbed('Merci !', 'Votre retour a bien été enregistré.')],
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default component;
