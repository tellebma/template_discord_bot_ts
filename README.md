# Discord Bot Template (TypeScript)

A comprehensive Discord bot template built with TypeScript and Discord.js v14, featuring advanced type safety, modern development practices, and a robust command system.

## Features

- 🚀 **TypeScript** - Full type safety and modern JavaScript features
- 🤖 **Slash Command Support** - Modern Discord slash commands with type checking
- 📁 **Organized Architecture** - Clean, modular file structure with path aliases
- 🔧 **Environment Configuration** - Secure configuration management with validation
- 📝 **Advanced Logging** - Structured logging with context and type safety
- 🏓 **Example Commands** - Ready-to-use TypeScript command examples
- 🚀 **Auto-deployment** - Automatic command registration
- 🛡️ **Security Features** - Built-in validation and sanitization
- 📋 **Command Templates** - Standardized command creation system with generics
- 🔄 **Hot Reload** - Development mode with tsx watch
- 🐳 **Docker Support** - Container-ready deployment with multi-stage builds
- 📚 **Comprehensive Documentation** - Detailed guides and API docs
- 🔍 **ESLint & Prettier** - Code quality and formatting tools
- 🏗️ **Build System** - TypeScript compilation with source maps

## Quick Start

1. **Clone and setup**
   ```bash
   cp -r template-ts my-discord-bot
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
template-ts/
├── src/                       # TypeScript source code
│   ├── app.ts                # Main application entry point
│   ├── commands/             # Slash commands
│   │   ├── ping.ts          # Basic ping command
│   │   ├── userinfo.ts      # User information command
│   │   ├── serverinfo.ts    # Server information command
│   │   └── echo.ts          # Echo command with validation
│   ├── events/              # Discord.js event handlers
│   │   ├── ready.ts         # Bot ready event
│   │   └── *.ts             # Additional event handlers
│   ├── utils/               # Utility modules
│   │   ├── config.ts        # Configuration management
│   │   ├── logger.ts        # Structured logging system
│   │   ├── commandBuilder.ts # Command builder utility
│   │   ├── commandTemplate.ts # Command template system
│   │   └── commandGenerator.ts # Command generation utility
│   ├── types/               # TypeScript type definitions
│   │   └── bot.ts           # Bot-specific types and interfaces
│   └── fonctions/           # Business logic modules
│       ├── config/          # Configuration modules
│       ├── api/             # API integration modules
│       └── database/        # Database operations
├── dist/                    # Compiled JavaScript (generated)
├── docs/                    # Documentation
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .eslintrc.js            # ESLint configuration
├── .prettierrc.js          # Prettier configuration
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore patterns
├── Dockerfile              # Container configuration
└── README.md               # This file
```

## Command System

This template features three ways to create commands with full TypeScript support:

### 1. Basic Commands

Simple Discord.js commands with type safety:

```typescript
import { SlashCommandBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('An example command'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Hello World!');
  },
};
```

### 2. Template Commands (Recommended)

Enhanced commands with built-in features and strict typing:

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { createStandardCommand } from '@/utils/commandTemplate';
import type { ChatInputCommandInteraction } from 'discord.js';

const commandData = new SlashCommandBuilder()
  .setName('example')
  .setDescription('An enhanced example command');

export default createStandardCommand({
  name: 'example',
  description: 'An enhanced example command',
  category: 'general',
  permissions: [],
  cooldown: 3,
  data: commandData,
  handler: async (
    interaction: ChatInputCommandInteraction, 
    params: Record<string, any>
  ): Promise<void> => {
    await interaction.reply('Hello from template system!');
  }
});
```

### 3. Generated Commands

Use the command generator with TypeScript:

```typescript
import { CommandGenerator } from '@/utils/commandGenerator';

const content = CommandGenerator.generateCommand('greet', {
  description: 'Greet a user',
  parameters: [
    {
      type: 'user',
      name: 'target',
      description: 'User to greet',
      required: true,
    }
  ],
  useTemplate: true,
});

CommandGenerator.saveCommand('greet', content, './src/commands');
```

## TypeScript Features

### Type Safety

All components are fully typed:

```typescript
// Strict parameter validation
interface CommandParameter {
  type: ParameterType;
  name: string;
  description: string;
  required?: boolean;
  validation?: ParameterValidation;
}

// Type-safe command handlers
type CommandHandler = (
  interaction: ChatInputCommandInteraction, 
  params: Record<string, any>
) => Promise<void>;
```

### Path Aliases

Import with clean path aliases:

```typescript
import { Logger } from '@/utils/logger';
import { createStandardCommand } from '@/utils/commandTemplate';
import type { CommandConfig } from '@/types/bot';
```

### Strict Configuration

TypeScript ensures type safety throughout:

```typescript
// tsconfig.json with strict settings
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "exactOptionalPropertyTypes": true
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Your bot's token | Yes |
| `DISCORD_CLIENT_ID` | Your application's client ID | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |
| `BOT_PREFIX` | Command prefix for legacy commands | No |

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the bot in production mode (requires build)
- `npm run dev` - Start with hot reload for development (tsx)
- `npm run dev:build` - Start TypeScript compiler in watch mode
- `npm run deploy:commands` - Deploy/update Discord slash commands
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check without emitting files
- `npm run clean` - Remove compiled files

## Development Features

- **Hot Reload** - Automatic restart with tsx during development
- **Type Checking** - Real-time TypeScript error detection
- **Code Quality** - ESLint with TypeScript rules
- **Auto-formatting** - Prettier integration
- **Path Mapping** - Clean imports with @ aliases
- **Source Maps** - Debug support with source maps
- **Build Optimization** - Production-ready compilation

## Example Commands

The template includes several TypeScript example commands:

- **`/ping`** - Basic latency check with type safety
- **`/userinfo`** - Display user information with typed embeds
- **`/serverinfo`** - Show server statistics with strict typing
- **`/echo`** - Echo messages with type-safe content filtering

## Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t my-discord-bot .
docker run -d --env-file .env my-discord-bot
```

### Type Safety in Production

The build process ensures:
- All TypeScript errors are caught at compile time
- Generated JavaScript is optimized
- Source maps available for debugging
- Type declarations included

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Run `npm run type-check` and `npm run lint`
5. Submit a pull request

## License

MIT