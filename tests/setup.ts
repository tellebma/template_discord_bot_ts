import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DISCORD_TOKEN = 'test-token';
process.env.DISCORD_CLIENT_ID = 'test-client-id';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Global test utilities
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      testUtils: typeof testUtils;
    }
  }
}

export const testUtils = {
  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Create a mock Discord interaction
   */
  createMockInteraction: (overrides = {}) => ({
    commandName: 'test',
    user: {
      id: '123456789',
      tag: 'TestUser#0001',
      username: 'TestUser',
    },
    guild: {
      id: '987654321',
      name: 'Test Guild',
    },
    channel: {
      id: '111222333',
      name: 'test-channel',
    },
    member: {
      permissions: {
        has: vi.fn().mockReturnValue(true),
      },
    },
    options: {
      getString: vi.fn(),
      getInteger: vi.fn(),
      getNumber: vi.fn(),
      getBoolean: vi.fn(),
      getUser: vi.fn(),
      getChannel: vi.fn(),
      getRole: vi.fn(),
      getMentionable: vi.fn(),
      getAttachment: vi.fn(),
    },
    reply: vi.fn().mockResolvedValue(undefined),
    followUp: vi.fn().mockResolvedValue(undefined),
    deferReply: vi.fn().mockResolvedValue(undefined),
    editReply: vi.fn().mockResolvedValue(undefined),
    replied: false,
    deferred: false,
    isChatInputCommand: vi.fn().mockReturnValue(true),
    ...overrides,
  }),

  /**
   * Create a mock Discord client
   */
  createMockClient: (overrides = {}) => ({
    user: {
      tag: 'TestBot#0001',
      id: '000000000',
    },
    guilds: {
      cache: {
        size: 1,
        reduce: vi.fn().mockReturnValue(100),
      },
    },
    commands: new Map(),
    on: vi.fn(),
    once: vi.fn(),
    login: vi.fn().mockResolvedValue('token'),
    ...overrides,
  }),
};

// Make testUtils available globally in tests
(global as unknown as { testUtils: typeof testUtils }).testUtils = testUtils;
