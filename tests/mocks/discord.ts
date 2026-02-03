import { vi } from 'vitest';

/**
 * Mock Discord.js module for testing
 */
export const mockCollection = () => {
  const map = new Map();
  return {
    set: vi.fn((key, value) => map.set(key, value)),
    get: vi.fn(key => map.get(key)),
    has: vi.fn(key => map.has(key)),
    delete: vi.fn(key => map.delete(key)),
    clear: vi.fn(() => map.clear()),
    size: map.size,
    forEach: vi.fn((fn: (value: unknown, key: string) => void) => map.forEach(fn)),
    map: vi.fn(<T>(fn: (value: unknown, key: string) => T): T[] =>
      Array.from(map.entries()).map(([k, v]) => fn(v, k))
    ),
    filter: vi.fn((fn: (value: unknown, key: string) => boolean) => {
      const filtered = new Map();
      map.forEach((v, k) => {
        if (fn(v, k)) filtered.set(k, v);
      });
      return filtered;
    }),
    find: vi.fn((fn: (value: unknown, key: string) => boolean) => {
      for (const [k, v] of map.entries()) {
        if (fn(v, k)) return v;
      }
      return undefined;
    }),
    values: vi.fn(() => map.values()),
    keys: vi.fn(() => map.keys()),
    entries: vi.fn(() => map.entries()),
    [Symbol.iterator]: () => map[Symbol.iterator](),
  };
};

export const mockSlashCommandBuilder = () => ({
  setName: vi.fn().mockReturnThis(),
  setDescription: vi.fn().mockReturnThis(),
  addStringOption: vi.fn().mockReturnThis(),
  addIntegerOption: vi.fn().mockReturnThis(),
  addNumberOption: vi.fn().mockReturnThis(),
  addBooleanOption: vi.fn().mockReturnThis(),
  addUserOption: vi.fn().mockReturnThis(),
  addChannelOption: vi.fn().mockReturnThis(),
  addRoleOption: vi.fn().mockReturnThis(),
  addMentionableOption: vi.fn().mockReturnThis(),
  addAttachmentOption: vi.fn().mockReturnThis(),
  addSubcommand: vi.fn().mockReturnThis(),
  addSubcommandGroup: vi.fn().mockReturnThis(),
  toJSON: vi.fn().mockReturnValue({
    name: 'test',
    description: 'Test command',
    options: [],
  }),
  name: 'test',
});

export const mockUser = (overrides = {}) => ({
  id: '123456789012345678',
  username: 'TestUser',
  discriminator: '0001',
  tag: 'TestUser#0001',
  bot: false,
  system: false,
  avatar: null,
  banner: null,
  accentColor: null,
  createdAt: new Date(),
  createdTimestamp: Date.now(),
  defaultAvatarURL: 'https://cdn.discordapp.com/embed/avatars/0.png',
  displayAvatarURL: vi.fn().mockReturnValue('https://cdn.discordapp.com/embed/avatars/0.png'),
  toString: vi.fn().mockReturnValue('<@123456789012345678>'),
  ...overrides,
});

export const mockGuild = (overrides = {}) => ({
  id: '987654321098765432',
  name: 'Test Guild',
  icon: null,
  ownerId: '123456789012345678',
  memberCount: 100,
  createdAt: new Date(),
  createdTimestamp: Date.now(),
  members: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  channels: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  roles: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  ...overrides,
});

export const mockChannel = (overrides = {}) => ({
  id: '111222333444555666',
  name: 'test-channel',
  type: 0,
  guild: mockGuild(),
  send: vi.fn().mockResolvedValue({}),
  toString: vi.fn().mockReturnValue('<#111222333444555666>'),
  ...overrides,
});

export const mockMember = (overrides = {}) => ({
  id: '123456789012345678',
  user: mockUser(),
  guild: mockGuild(),
  nickname: null,
  displayName: 'TestUser',
  roles: {
    cache: mockCollection(),
    highest: { id: '000000000000000001', position: 1 },
  },
  permissions: {
    has: vi.fn().mockReturnValue(true),
    toArray: vi.fn().mockReturnValue(['SendMessages', 'ViewChannel']),
  },
  joinedAt: new Date(),
  joinedTimestamp: Date.now(),
  kick: vi.fn().mockResolvedValue(undefined),
  ban: vi.fn().mockResolvedValue(undefined),
  timeout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

export const mockInteraction = (overrides = {}) => ({
  id: '999888777666555444',
  type: 2,
  commandName: 'test',
  commandId: '111222333444555666',
  user: mockUser(),
  member: mockMember(),
  guild: mockGuild(),
  guildId: '987654321098765432',
  channel: mockChannel(),
  channelId: '111222333444555666',
  locale: 'en-US',
  guildLocale: 'en-US',
  createdAt: new Date(),
  createdTimestamp: Date.now(),
  replied: false,
  deferred: false,
  ephemeral: false,
  options: {
    getString: vi.fn().mockReturnValue(null),
    getInteger: vi.fn().mockReturnValue(null),
    getNumber: vi.fn().mockReturnValue(null),
    getBoolean: vi.fn().mockReturnValue(null),
    getUser: vi.fn().mockReturnValue(null),
    getChannel: vi.fn().mockReturnValue(null),
    getRole: vi.fn().mockReturnValue(null),
    getMentionable: vi.fn().mockReturnValue(null),
    getAttachment: vi.fn().mockReturnValue(null),
    getSubcommand: vi.fn().mockReturnValue(null),
    getSubcommandGroup: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(null),
    data: [],
  },
  reply: vi.fn().mockResolvedValue(undefined),
  deferReply: vi.fn().mockResolvedValue(undefined),
  editReply: vi.fn().mockResolvedValue(undefined),
  deleteReply: vi.fn().mockResolvedValue(undefined),
  followUp: vi.fn().mockResolvedValue(undefined),
  fetchReply: vi.fn().mockResolvedValue({}),
  showModal: vi.fn().mockResolvedValue(undefined),
  isChatInputCommand: vi.fn().mockReturnValue(true),
  isButton: vi.fn().mockReturnValue(false),
  isSelectMenu: vi.fn().mockReturnValue(false),
  isModalSubmit: vi.fn().mockReturnValue(false),
  isAutocomplete: vi.fn().mockReturnValue(false),
  inGuild: vi.fn().mockReturnValue(true),
  inCachedGuild: vi.fn().mockReturnValue(true),
  ...overrides,
});

export const mockClient = (overrides = {}) => ({
  user: {
    id: '000000000000000000',
    tag: 'TestBot#0001',
    username: 'TestBot',
    setActivity: vi.fn(),
    setPresence: vi.fn(),
  },
  guilds: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  channels: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  users: {
    cache: mockCollection(),
    fetch: vi.fn(),
  },
  commands: mockCollection(),
  application: {
    id: '000000000000000000',
    commands: {
      set: vi.fn().mockResolvedValue([]),
      fetch: vi.fn().mockResolvedValue([]),
    },
  },
  on: vi.fn().mockReturnThis(),
  once: vi.fn().mockReturnThis(),
  off: vi.fn().mockReturnThis(),
  emit: vi.fn().mockReturnValue(true),
  login: vi.fn().mockResolvedValue('token'),
  destroy: vi.fn().mockResolvedValue(undefined),
  isReady: vi.fn().mockReturnValue(true),
  readyAt: new Date(),
  readyTimestamp: Date.now(),
  uptime: 0,
  ws: {
    ping: 50,
    status: 0,
  },
  ...overrides,
});
