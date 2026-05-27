# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discord bot template built with TypeScript and discord.js v14. Uses file-based auto-loading for commands and events.

## Commands

```bash
# Development (hot reload)
npm run dev

# Build & run production
npm run build && npm start

# Deploy slash commands to Discord
npm run deploy:commands

# Testing
npm run test:run          # single run
npm test                  # watch mode
npm run test:coverage     # with coverage report

# Code quality
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run format            # Prettier format
npm run type-check        # TypeScript check
npm run validate          # all checks: type-check + lint + test
```

## Architecture

**Entry point:** `src/app.ts` — creates the Discord client, auto-loads all commands from `src/commands/` and events from `src/events/`, deploys commands to Discord API, and handles interactions.

**File-based routing:** Drop a `.ts` file in `src/commands/` or `src/events/` and it's automatically loaded. Each command file must export an object with `data` (SlashCommandBuilder) and `execute` properties.

**Interactions:** Le routeur central `src/events/interactionCreate.ts` dispatche les slash commands, l'autocomplete et les composants. Les composants (boutons, modals, select menus) sont auto-chargés depuis `src/interactions/{buttons,modals,selectMenus}/` et routés par préfixe de `customId` (convention `namespace:action[:payload]`). Une commande peut exposer une méthode `autocomplete` (voir `src/commands/help.ts`).

**Persistance:** `src/database/repository.ts` définit l'interface `Repository<T>` ; `MemoryRepository<T>` en fournit une implémentation mémoire. Remplacez-la par une implémentation persistante (PostgreSQL, MongoDB, Prisma...) sans toucher aux consommateurs.

**Observabilité:** `src/utils/sentry.ts` fournit une intégration Sentry optionnelle (no-op sans `SENTRY_DSN`) et `src/utils/sanitize.ts` masque les credentials dans les logs et les erreurs.

**Démos incluses:** `/help` (autocomplete), `/poll` (boutons + compteur live), `/feedback` (modal), `/menu` (select menu).

### Command Patterns

**Recommended — `defineCommand`** (`src/utils/defineCommand.ts`): Provides a `CommandContext` with typed option getters, automatic permission checking, cooldown management, and error handling.

```typescript
import { defineCommand } from '@/utils/defineCommand';
export default defineCommand({
  data: new SlashCommandBuilder().setName('example').setDescription('...'),
  category: 'general',
  cooldown: 5,
  permissions: [PermissionFlagsBits.SendMessages],
  async execute(ctx) {
    const value = ctx.getString('option');
    await ctx.reply('...');
  }
});
```

**Simple — direct export:** For basic commands without permissions/cooldowns.

```typescript
export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
  }
};
```

There is also a `createStandardCommand` template pattern in `src/utils/commandTemplate.ts`.

### Key Utilities (`src/utils/`)

- **errors.ts** — Error hierarchy: `BotError` > `CommandError`, `ValidationError`, `PermissionError`, `CooldownError`, `ConfigurationError`, `ExternalServiceError`. Centralized `ErrorHandler` with `handleInteractionError()`.
- **logger.ts** — Structured JSON logger: `Logger.info()`, `.warn()`, `.error()`, `.debug()`.
- **config.ts** — Config object wrapping env vars: `config.discord.token`, `config.discord.clientId`, `config.bot.prefix`, `config.bot.isDevelopment`.

### Path Aliases

Configured in both `tsconfig.json` and `vitest.config.ts`:
- `@/*` → `src/*`
- `@/commands/*`, `@/events/*`, `@/utils/*`, `@/types/*`, `@/fonctions/*`

## TypeScript

Very strict `tsconfig.json`: `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`. Use bracket notation for index signatures. Prefix unused parameters with `_`.

## Testing

Vitest with setup file at `tests/setup.ts`. Test files go in `tests/unit/`. Mocks for discord.js are in `tests/mocks/discord.ts` and fixtures in `tests/fixtures/interactions.ts`. Coverage threshold is 70% across all metrics.

## Commits

Conventional commits enforced by commitlint (husky pre-commit + commit-msg hooks). Format: `type: subject` (max 100 chars). Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Lint-staged runs ESLint fix + Prettier on `.ts` files.

## Environment

Requires Node.js >= 18. Environment variables `DISCORD_TOKEN` and `DISCORD_CLIENT_ID` are required (see `.env.example`).

Variable optionnelle : `SENTRY_DSN` active le reporting d'erreurs Sentry.
