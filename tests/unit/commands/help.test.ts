import { describe, it, expect, vi } from 'vitest';
import { Collection } from 'discord.js';
import help from '@/commands/help';

function makeAutocomplete(focused: string, commandNames: string[]) {
  const commands = new Collection(
    commandNames.map(name => [name, { data: { name, description: `${name} desc` } }])
  );
  const respond = vi.fn();
  return {
    interaction: {
      client: { commands },
      options: { getFocused: () => focused },
      respond,
    },
    respond,
  };
}

describe('/help', () => {
  it('expose data et autocomplete', () => {
    expect(help.data.name).toBe('help');
    expect(typeof help.autocomplete).toBe('function');
  });

  it('autocomplete filtre les commandes par saisie', async () => {
    const { interaction, respond } = makeAutocomplete('pi', ['ping', 'poll', 'help']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await help.autocomplete!(interaction as any);
    expect(respond).toHaveBeenCalledWith([{ name: 'ping', value: 'ping' }]);
  });
});
