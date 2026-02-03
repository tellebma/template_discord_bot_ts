import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockInteraction, mockClient } from '../../mocks/discord';

// Mock the ping command
const createPingCommand = () => ({
  data: {
    name: 'ping',
    description: 'Replies with Pong and latency information',
    toJSON: () => ({ name: 'ping', description: 'Replies with Pong!' }),
  },
  execute: vi.fn(async (interaction: ReturnType<typeof mockInteraction>) => {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = Date.now() - interaction.createdTimestamp;
    const apiLatency = 50; // Mocked

    await interaction.editReply(`Pong! Latency: ${latency}ms | API Latency: ${apiLatency}ms`);
  }),
});

describe('Ping Command', () => {
  let pingCommand: ReturnType<typeof createPingCommand>;
  let interaction: ReturnType<typeof mockInteraction>;

  beforeEach(() => {
    pingCommand = createPingCommand();
    interaction = mockInteraction({
      commandName: 'ping',
      createdTimestamp: Date.now(),
    });

    // Mock reply to return a message-like object
    interaction.reply = vi.fn().mockResolvedValue({
      createdTimestamp: Date.now(),
    });
  });

  describe('command structure', () => {
    it('should have correct name', () => {
      expect(pingCommand.data.name).toBe('ping');
    });

    it('should have a description', () => {
      expect(pingCommand.data.description).toBeDefined();
      expect(pingCommand.data.description.length).toBeGreaterThan(0);
    });

    it('should have an execute function', () => {
      expect(pingCommand.execute).toBeDefined();
      expect(typeof pingCommand.execute).toBe('function');
    });

    it('should generate valid JSON', () => {
      const json = pingCommand.data.toJSON();
      expect(json.name).toBe('ping');
    });
  });

  describe('execution', () => {
    it('should reply to the interaction', async () => {
      await pingCommand.execute(interaction);

      expect(interaction.reply).toHaveBeenCalled();
    });

    it('should edit reply with latency info', async () => {
      await pingCommand.execute(interaction);

      expect(interaction.editReply).toHaveBeenCalled();
      const editCall = interaction.editReply.mock.calls[0]?.[0];
      expect(editCall).toContain('Pong!');
      expect(editCall).toContain('Latency');
    });

    it('should include API latency in response', async () => {
      await pingCommand.execute(interaction);

      const editCall = interaction.editReply.mock.calls[0]?.[0];
      expect(editCall).toContain('API Latency');
    });
  });
});

describe('Command Integration Pattern', () => {
  it('should demonstrate command registration pattern', () => {
    const client = mockClient();
    const command = createPingCommand();

    client.commands.set(command.data.name, command);

    expect(client.commands.get('ping')).toBe(command);
  });

  it('should demonstrate command lookup pattern', () => {
    const client = mockClient();
    const command = createPingCommand();
    client.commands.set('ping', command);

    const interaction = mockInteraction({ commandName: 'ping' });
    const foundCommand = client.commands.get(interaction.commandName);

    expect(foundCommand).toBe(command);
  });
});
