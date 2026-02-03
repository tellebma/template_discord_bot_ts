# Discord Bot Template (TypeScript)

A comprehensive Discord bot template built with TypeScript and Discord.js v14, featuring advanced type safety, modern development practices, CI/CD, testing, and a robust error handling system.

[![CI](https://github.com/your-username/discord-bot-template-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/discord-bot-template-ts/actions/workflows/ci.yml)
[![Release](https://github.com/your-username/discord-bot-template-ts/actions/workflows/release.yml/badge.svg)](https://github.com/your-username/discord-bot-template-ts/actions/workflows/release.yml)
[![codecov](https://codecov.io/gh/your-username/discord-bot-template-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/discord-bot-template-ts)

## Features

- **TypeScript** - Full type safety with strict mode enabled
- **Slash Commands** - Modern Discord slash commands with type checking
- **Organized Architecture** - Clean, modular file structure with path aliases
- **Error Handling** - Comprehensive error management system with categorization
- **Testing** - Unit testing setup with Vitest and coverage reporting
- **CI/CD** - GitHub Actions with semantic release automation
- **Logging** - Structured JSON logging with context and severity levels
- **Git Hooks** - Pre-commit and commit-msg hooks with Husky
- **Code Quality** - ESLint, Prettier, and lint-staged integration
- **Docker Support** - Container-ready deployment with multi-stage builds

## Quick Start

1. **Clone and setup**
   ```bash
   git clone https://github.com/your-username/discord-bot-template-ts.git my-discord-bot
   cd my-discord-bot
   cp .env.example .env
   npm install
   ```

2. **Configure your bot**
   - Create a new application at https://discord.com/developers/applications
   - Create a bot and copy the token to your `.env` file
   - Copy the Application ID to your `.env` file as DISCORD_CLIENT_ID

3. **Run the bot**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Or build and run production
   npm run build
   npm start
   ```

## Project Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline (lint, test, build)
│       └── release.yml         # Semantic release automation
├── .husky/                     # Git hooks
│   ├── pre-commit              # Lint-staged hook
│   └── commit-msg              # Commitlint hook
├── src/
│   ├── app.ts                  # Main application entry point
│   ├── commands/               # Slash commands
│   ├── events/                 # Discord.js event handlers
│   ├── utils/
│   │   ├── config.ts           # Configuration management
│   │   ├── logger.ts           # Structured logging system
│   │   ├── errors.ts           # Error handling system
│   │   ├── commandTemplate.ts  # Command template system
│   │   └── index.ts            # Utility exports
│   ├── types/                  # TypeScript type definitions
│   └── fonctions/              # Business logic modules
├── tests/
│   ├── setup.ts                # Test configuration
│   ├── mocks/                  # Mock utilities
│   ├── fixtures/               # Test fixtures
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── dist/                       # Compiled JavaScript (generated)
├── coverage/                   # Test coverage reports (generated)
├── vitest.config.ts            # Vitest configuration
├── commitlint.config.js        # Commit message linting
├── .releaserc.json             # Semantic release config
└── package.json                # Dependencies and scripts
```

## Error Handling System

The template includes a comprehensive error handling system with:

### Error Types

```typescript
import {
  CommandError,
  ValidationError,
  PermissionError,
  CooldownError,
  ConfigurationError,
  ExternalServiceError,
  ErrorCode,
  ErrorSeverity
} from '@/utils';

// Command execution error
throw new CommandError('Failed to execute', 'ping', 'Something went wrong');

// Validation error
throw new ValidationError('Invalid input', 'username', 'string');

// Permission error
throw new PermissionError(['Administrator', 'ManageGuild']);

// Cooldown error
throw new CooldownError(5, 'ping');
```

### Error Handler

```typescript
import { ErrorHandler, errorMiddleware } from '@/utils';

// Handle errors globally
await ErrorHandler.handle(error, { userId: '123' });

// Handle interaction errors with user feedback
await ErrorHandler.handleInteractionError(error, interaction);

// Register custom error handlers
ErrorHandler.registerHandler(async (error) => {
  // Send to external monitoring service
  await sendToSentry(error);
});

// Wrap command handlers with error middleware
const wrappedExecute = errorMiddleware(execute);
```

### Error Codes

| Code | Category |
|------|----------|
| E1xxx | General errors |
| E2xxx | Command errors |
| E3xxx | Validation errors |
| E4xxx | Permission errors |
| E5xxx | Rate limiting |
| E6xxx | Configuration errors |
| E7xxx | External service errors |

## Testing

The template uses Vitest for testing with full TypeScript support.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Open Vitest UI
npm run test:ui
```

### Writing Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mockInteraction } from '../mocks/discord';

describe('Ping Command', () => {
  it('should reply with pong', async () => {
    const interaction = mockInteraction({ commandName: 'ping' });

    await pingCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalled();
  });
});
```

### Test Fixtures

```typescript
import { interactionFixtures, userFixtures } from '../fixtures/interactions';

// Pre-configured interaction for ping command
const interaction = interactionFixtures.ping();

// Interaction with specific options
const echoInteraction = interactionFixtures.echo('Hello World');
```

## CI/CD Pipeline

### Continuous Integration

The CI pipeline runs on every push and pull request:

1. **Lint** - ESLint and Prettier checks
2. **Type Check** - TypeScript compilation check
3. **Test** - Unit tests with coverage
4. **Build** - Production build verification

### Semantic Release

Automated versioning and releases based on conventional commits:

| Commit Type | Version Bump |
|-------------|--------------|
| `feat:` | Minor (1.x.0) |
| `fix:` | Patch (1.0.x) |
| `perf:` | Patch |
| `BREAKING CHANGE:` | Major (x.0.0) |

### Commit Message Format

```bash
# Feature
git commit -m "feat: add user profile command"

# Bug fix
git commit -m "fix: resolve cooldown calculation"

# Breaking change
git commit -m "feat!: redesign command system

BREAKING CHANGE: Command handlers now receive parsed parameters"
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests with coverage |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code |
| `npm run type-check` | Type check only |
| `npm run validate` | Run all checks |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your bot's token | Yes |
| `DISCORD_CLIENT_ID` | Your application's client ID | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |
| `BOT_PREFIX` | Command prefix for legacy commands | No |

## Command System

### Basic Commands

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot latency'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
  },
};
```

### Template Commands (Recommended)

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { createStandardCommand } from '@/utils/commandTemplate';

export default createStandardCommand({
  name: 'greet',
  description: 'Greet a user',
  category: 'fun',
  permissions: [],
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('greet')
    .setDescription('Greet a user')
    .addUserOption(opt =>
      opt.setName('user').setDescription('User to greet').setRequired(true)
    ),
  handler: async (interaction, params) => {
    await interaction.reply(`Hello, ${params.user}!`);
  }
});
```

## Deployment

### Docker

```bash
docker build -t my-discord-bot .
docker run -d --env-file .env my-discord-bot
```

### Production

```bash
npm run build
NODE_ENV=production npm start
```

## GitHub Repository Setup

1. **Enable GitHub Actions** in repository settings
2. **Add secrets** for semantic release:
   - `GITHUB_TOKEN` (automatic)
   - `NPM_TOKEN` (optional, for npm publishing)
   - `CODECOV_TOKEN` (for coverage reports)

3. **Branch protection** (recommended):
   - Require status checks (CI)
   - Require pull request reviews

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make changes with proper TypeScript types
4. Write tests for new functionality
5. Run validation: `npm run validate`
6. Commit with conventional commits: `git commit -m "feat: add feature"`
7. Push and create a pull request

## License

MIT
