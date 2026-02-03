import { mockInteraction, mockUser, mockGuild, mockChannel, mockMember } from '../mocks/discord';

/**
 * Pre-configured interaction fixtures for common test scenarios
 */
export const interactionFixtures = {
  /**
   * Basic ping command interaction
   */
  ping: () =>
    mockInteraction({
      commandName: 'ping',
      createdTimestamp: Date.now(),
    }),

  /**
   * Echo command with message option
   */
  echo: (message: string) => {
    const interaction = mockInteraction({
      commandName: 'echo',
    });
    interaction.options.getString.mockImplementation((name: string) =>
      name === 'message' ? message : null
    );
    return interaction;
  },

  /**
   * User info command targeting a specific user
   */
  userInfo: (targetUser = mockUser()) => {
    const interaction = mockInteraction({
      commandName: 'userinfo',
    });
    interaction.options.getUser.mockReturnValue(targetUser);
    return interaction;
  },

  /**
   * Server info command
   */
  serverInfo: () =>
    mockInteraction({
      commandName: 'serverinfo',
    }),

  /**
   * Interaction from a user without permissions
   */
  noPermissions: (commandName: string) => {
    const member = mockMember();
    member.permissions.has.mockReturnValue(false);

    return mockInteraction({
      commandName,
      member,
    });
  },

  /**
   * Interaction that has already been replied to
   */
  alreadyReplied: (commandName: string) =>
    mockInteraction({
      commandName,
      replied: true,
    }),

  /**
   * Deferred interaction
   */
  deferred: (commandName: string) =>
    mockInteraction({
      commandName,
      deferred: true,
    }),

  /**
   * Interaction in DMs (no guild)
   */
  dm: (commandName: string) =>
    mockInteraction({
      commandName,
      guild: null,
      guildId: null,
      inGuild: () => false,
      inCachedGuild: () => false,
    }),

  /**
   * Interaction with custom options
   */
  withOptions: (
    commandName: string,
    options: Record<string, unknown>
  ) => {
    const interaction = mockInteraction({ commandName });

    if (options.string) {
      interaction.options.getString.mockImplementation(
        (name: string) => (options.string as Record<string, string>)[name] ?? null
      );
    }
    if (options.integer) {
      interaction.options.getInteger.mockImplementation(
        (name: string) => (options.integer as Record<string, number>)[name] ?? null
      );
    }
    if (options.boolean) {
      interaction.options.getBoolean.mockImplementation(
        (name: string) => (options.boolean as Record<string, boolean>)[name] ?? null
      );
    }
    if (options.user) {
      interaction.options.getUser.mockImplementation(
        (name: string) => (options.user as Record<string, unknown>)[name] ?? null
      );
    }

    return interaction;
  },
};

/**
 * User fixtures for testing
 */
export const userFixtures = {
  regular: () => mockUser(),
  bot: () => mockUser({ bot: true }),
  admin: () =>
    mockUser({
      id: '111111111111111111',
      username: 'Admin',
      tag: 'Admin#0001',
    }),
};

/**
 * Guild fixtures for testing
 */
export const guildFixtures = {
  small: () => mockGuild({ memberCount: 10 }),
  medium: () => mockGuild({ memberCount: 500 }),
  large: () => mockGuild({ memberCount: 10000 }),
};

/**
 * Channel fixtures for testing
 */
export const channelFixtures = {
  text: () => mockChannel({ type: 0 }),
  voice: () => mockChannel({ type: 2 }),
  thread: () => mockChannel({ type: 11 }),
};
