# Portage bonnes pratiques DVG + features démo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter les patterns robustes du bot DVG dans ce template et ajouter des fonctionnalités démo (autocomplete, boutons, modals, select menus) montrant l'éventail de discord.js v14.

**Architecture:** Routeur d'interactions centralisé (`events/interactionCreate.ts`) qui dispatche commandes/autocomplete/composants ; composants auto-chargés depuis `src/interactions/**` routés par préfixe de `customId` ; persistance via interface `Repository<T>` + impl. mémoire ; infra (shutdown gracieux, Sentry optionnel + sanitize, Docker).

**Tech Stack:** TypeScript strict, discord.js v14, Vitest, cron, @sentry/node (optionnel), Docker.

**Branche de travail :** `feat/dvg-best-practices` (déjà créée, design committé).

---

## File Structure

- `src/database/repository.ts` — interface `Repository<T>` (créer)
- `src/database/memoryRepository.ts` — impl. `Map` (créer)
- `src/utils/sanitize.ts` — scrubbing credentials (créer)
- `src/utils/sentry.ts` — Sentry optionnel (créer)
- `src/utils/embeds.ts` — builders embeds réutilisables (créer)
- `src/utils/index.ts` — ajouter les ré-exports (modifier)
- `src/types/bot.ts` — `autocomplete?` sur BotCommand, `BotComponent`, `components` sur ExtendedClient (modifier)
- `src/interactions/index.ts` — types + `componentKey` + `resolveComponent` (créer)
- `src/interactions/buttons/poll.ts`, `modals/feedback.ts`, `selectMenus/menu.ts` (créer)
- `src/events/interactionCreate.ts` — routeur central (créer)
- `src/commands/help.ts`, `poll.ts`, `feedback.ts`, `menu.ts` (créer)
- `src/app.ts` — loader composants, registre crons, shutdown gracieux, init Sentry, retrait du handler inline (modifier)
- `Dockerfile`, `docker-compose.yml`, `.dockerignore` (créer)
- `CLAUDE.md`, `README.md` (modifier)
- Tests : `tests/unit/database/memoryRepository.test.ts`, `tests/unit/utils/sanitize.test.ts`, `tests/unit/interactions/resolve.test.ts`, `tests/unit/commands/help.test.ts`

---

## Task 1 : Persistance abstraite

**Files:**
- Create: `src/database/repository.ts`
- Create: `src/database/memoryRepository.ts`
- Test: `tests/unit/database/memoryRepository.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```typescript
// tests/unit/database/memoryRepository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '@/database/memoryRepository';

interface Item {
  id: string;
  label: string;
}

describe('MemoryRepository', () => {
  let repo: MemoryRepository<Item>;

  beforeEach(() => {
    repo = new MemoryRepository<Item>();
  });

  it('stocke et récupère une entité', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    expect(await repo.get('1')).toEqual({ id: '1', label: 'a' });
  });

  it('retourne undefined pour une clé absente', async () => {
    expect(await repo.get('nope')).toBeUndefined();
  });

  it('liste toutes les entités', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    await repo.set('2', { id: '2', label: 'b' });
    expect(await repo.getAll()).toHaveLength(2);
  });

  it('supprime une entité et signale le résultat', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    expect(await repo.delete('1')).toBe(true);
    expect(await repo.delete('1')).toBe(false);
    expect(await repo.get('1')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npm run test:run -- tests/unit/database/memoryRepository.test.ts`
Expected: FAIL — `Cannot find module '@/database/memoryRepository'`

- [ ] **Step 3: Créer l'interface**

```typescript
// src/database/repository.ts
/**
 * Contrat de persistance générique, indépendant du backend.
 *
 * Pour brancher une vraie base (PostgreSQL, MongoDB, Prisma...), créez une
 * classe qui implémente cette interface (ex: `PostgresRepository<T>`) et
 * injectez-la à la place de `MemoryRepository`. Les consommateurs ne changent
 * pas car ils dépendent de `Repository<T>`, pas de l'implémentation.
 */
export interface Repository<T> {
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  set(id: string, value: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}
```

- [ ] **Step 4: Créer l'implémentation mémoire**

```typescript
// src/database/memoryRepository.ts
import type { Repository } from './repository';

/**
 * Implémentation en mémoire de {@link Repository}, basée sur une Map.
 *
 * Idéale pour le développement et les tests. Les données sont perdues au
 * redémarrage : remplacez-la par une implémentation persistante en production.
 */
export class MemoryRepository<T> implements Repository<T> {
  private readonly store = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.store.get(id);
  }

  async getAll(): Promise<T[]> {
    return [...this.store.values()];
  }

  async set(id: string, value: T): Promise<void> {
    this.store.set(id, value);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
```

- [ ] **Step 5: Lancer le test pour vérifier le succès**

Run: `npm run test:run -- tests/unit/database/memoryRepository.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add src/database tests/unit/database
git commit -m "feat: add abstract Repository with in-memory implementation"
```

---

## Task 2 : Sanitize (scrubbing credentials)

**Files:**
- Create: `src/utils/sanitize.ts`
- Test: `tests/unit/utils/sanitize.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```typescript
// tests/unit/utils/sanitize.test.ts
import { describe, it, expect } from 'vitest';
import { sanitizeMessage, sanitizeError } from '@/utils/sanitize';

describe('sanitizeMessage', () => {
  it('masque une URL de connexion postgres', () => {
    const out = sanitizeMessage('connect postgres://user:pass@host:5432/db now');
    expect(out).not.toContain('pass');
    expect(out).toContain('[REDACTED]');
  });

  it('masque un token Discord (Bot ...)', () => {
    const out = sanitizeMessage('Authorization: Bot MTEx.abc.def-ghi');
    expect(out).not.toContain('MTEx.abc.def-ghi');
    expect(out).toContain('[REDACTED]');
  });

  it('laisse un message neutre intact', () => {
    expect(sanitizeMessage('hello world')).toBe('hello world');
  });
});

describe('sanitizeError', () => {
  it('nettoie le message et la stack', () => {
    const err = new Error('fail postgres://user:pass@host:5432/db');
    const cleaned = sanitizeError(err);
    expect(cleaned.message).not.toContain('pass');
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npm run test:run -- tests/unit/utils/sanitize.test.ts`
Expected: FAIL — `Cannot find module '@/utils/sanitize'`

- [ ] **Step 3: Implémenter**

```typescript
// src/utils/sanitize.ts
/**
 * Masque les secrets (URLs de connexion, tokens) avant de les écrire dans les
 * logs ou de les envoyer à un service externe (Sentry).
 */
const PATTERNS: RegExp[] = [
  // URLs de connexion type postgres://user:pass@host:port/db
  /\b(?:postgres|postgresql|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s'"]+/gi,
  // Tokens Discord (entête Authorization: Bot <token>)
  /\bBot\s+[A-Za-z0-9._-]{20,}/g,
];

const REDACTED = '[REDACTED]';

export function sanitizeMessage(message: string): string {
  return PATTERNS.reduce((acc, pattern) => acc.replace(pattern, REDACTED), message);
}

export function sanitizeError<E extends Error>(error: E): E {
  error.message = sanitizeMessage(error.message);
  if (error.stack) {
    error.stack = sanitizeMessage(error.stack);
  }
  return error;
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npm run test:run -- tests/unit/utils/sanitize.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/utils/sanitize.ts tests/unit/utils/sanitize.test.ts
git commit -m "feat: add credential sanitization utility"
```

---

## Task 3 : Sentry optionnel

**Files:**
- Create: `src/utils/sentry.ts`
- Modify: `package.json` (dépendance `@sentry/node`)

- [ ] **Step 1: Ajouter la dépendance**

Run: `npm install @sentry/node@^8`
Expected: ajoute `@sentry/node` à `dependencies` dans `package.json`.

- [ ] **Step 2: Implémenter le wrapper**

```typescript
// src/utils/sentry.ts
import type * as SentryNode from '@sentry/node';
import { Logger } from './logger';
import { sanitizeMessage } from './sanitize';

/**
 * Intégration Sentry optionnelle. Toutes les fonctions sont des no-op si la
 * variable d'environnement SENTRY_DSN est absente, ce qui rend l'observabilité
 * activable sans toucher au code applicatif.
 */
let sentry: typeof SentryNode | null = null;

export function initSentry(): void {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    Logger.debug('Sentry disabled (no SENTRY_DSN)');
    return;
  }

  try {
    // Import paresseux : évite de charger le SDK quand Sentry est désactivé.
    sentry = require('@sentry/node') as typeof SentryNode;
    sentry.init({
      dsn,
      environment: process.env['NODE_ENV'] ?? 'production',
      tracesSampleRate: 0,
      beforeSend(event) {
        if (event.message) {
          event.message = sanitizeMessage(event.message);
        }
        return event;
      },
    });
    Logger.info('Sentry initialized');
  } catch (error) {
    Logger.warn('Failed to initialize Sentry', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (!sentry) return;
  sentry.captureException(error, context ? { extra: context } : undefined);
}

export async function flushSentry(timeoutMs = 2000): Promise<void> {
  if (!sentry) return;
  try {
    await sentry.flush(timeoutMs);
  } catch {
    // Best-effort : ne jamais bloquer le shutdown sur le flush.
  }
}
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS (aucune erreur)

> Note : `@sentry/node@^8` expose `init`, `captureException`, `flush`. Si l'install résout une version majeure différente, vérifier ces trois symboles.

- [ ] **Step 4: Commit**

```bash
git add src/utils/sentry.ts package.json package-lock.json
git commit -m "feat: add optional Sentry integration (no-op without DSN)"
```

---

## Task 4 : Embeds réutilisables

**Files:**
- Create: `src/utils/embeds.ts`

- [ ] **Step 1: Implémenter**

```typescript
// src/utils/embeds.ts
import { EmbedBuilder, Colors } from 'discord.js';

/**
 * Builders d'embeds cohérents pour des réponses standardisées.
 * Centraliser les couleurs/format évite la duplication entre commandes.
 */
export function successEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(Colors.Green).setTitle(`✅ ${title}`);
  if (description) embed.setDescription(description);
  return embed;
}

export function errorEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(Colors.Red).setTitle(`❌ ${title}`);
  if (description) embed.setDescription(description);
  return embed;
}

export function infoEmbed(title: string, description?: string): EmbedBuilder {
  const embed = new EmbedBuilder().setColor(Colors.Blurple).setTitle(title);
  if (description) embed.setDescription(description);
  return embed;
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/utils/embeds.ts
git commit -m "feat: add reusable embed builders"
```

---

## Task 5 : Types & ré-exports

**Files:**
- Modify: `src/types/bot.ts`
- Modify: `src/utils/index.ts`

- [ ] **Step 1: Étendre `src/types/bot.ts`**

Ajouter l'import en tête (remplacer le bloc d'import discord.js existant pour inclure `AutocompleteInteraction`, `MessageComponentInteraction`, `ModalSubmitInteraction`) :

```typescript
import {
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
```

Remplacer l'interface `BotCommand` et `ExtendedClient` par :

```typescript
export interface BotCommand {
  data: AnySlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  /** Optionnel : gère l'autocomplete des options de cette commande. */
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

/**
 * Composant interactif (bouton, select menu, modal) routé par préfixe de
 * customId. Convention : customId = "namespace:action[:payload]", la clé de
 * registre étant "namespace:action".
 */
export interface BotComponent {
  prefix: string;
  execute: (
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ) => Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, BotCommand>;
  components: Collection<string, BotComponent>;
}
```

- [ ] **Step 2: Ajouter le ré-export embeds dans `src/utils/index.ts`**

Ajouter à la fin du fichier :

```typescript
export { successEmbed, errorEmbed, infoEmbed } from './embeds';
export { sanitizeMessage, sanitizeError } from './sanitize';
export { initSentry, captureError, flushSentry } from './sentry';
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/types/bot.ts src/utils/index.ts
git commit -m "feat: extend types for autocomplete and interactive components"
```

---

## Task 6 : Registre des composants + résolution

**Files:**
- Create: `src/interactions/index.ts`
- Test: `tests/unit/interactions/resolve.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```typescript
// tests/unit/interactions/resolve.test.ts
import { describe, it, expect } from 'vitest';
import { Collection } from 'discord.js';
import { componentKey, resolveComponent } from '@/interactions';
import type { BotComponent } from '@/types/bot';

const fake: BotComponent = { prefix: 'poll:vote', execute: async () => {} };

describe('componentKey', () => {
  it('garde les deux premiers segments', () => {
    expect(componentKey('poll:vote:yes')).toBe('poll:vote');
    expect(componentKey('feedback:submit')).toBe('feedback:submit');
  });
});

describe('resolveComponent', () => {
  const registry = new Collection<string, BotComponent>([['poll:vote', fake]]);

  it('résout par préfixe avec payload', () => {
    expect(resolveComponent(registry, 'poll:vote:yes')).toBe(fake);
  });

  it('retourne undefined si aucun handler', () => {
    expect(resolveComponent(registry, 'unknown:thing')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npm run test:run -- tests/unit/interactions/resolve.test.ts`
Expected: FAIL — `Cannot find module '@/interactions'`

- [ ] **Step 3: Implémenter**

```typescript
// src/interactions/index.ts
import type { Collection } from 'discord.js';
import type { BotComponent } from '@/types/bot';

/**
 * Extrait la clé de registre d'un customId.
 * Convention : "namespace:action[:payload]" → "namespace:action".
 */
export function componentKey(customId: string): string {
  return customId.split(':').slice(0, 2).join(':');
}

/**
 * Récupère le payload d'un customId (3e segment et au-delà), ou '' si absent.
 */
export function componentPayload(customId: string): string {
  return customId.split(':').slice(2).join(':');
}

/**
 * Résout le composant enregistré pour un customId donné.
 */
export function resolveComponent(
  registry: Collection<string, BotComponent>,
  customId: string
): BotComponent | undefined {
  return registry.get(componentKey(customId));
}
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npm run test:run -- tests/unit/interactions/resolve.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/interactions/index.ts tests/unit/interactions
git commit -m "feat: add component registry resolution by customId prefix"
```

---

## Task 7 : Routeur d'interactions centralisé

**Files:**
- Create: `src/events/interactionCreate.ts`

> Ce routeur remplacera le handler inline de `app.ts` (retiré en Task 12).

- [ ] **Step 1: Implémenter le routeur**

```typescript
// src/events/interactionCreate.ts
import { Interaction } from 'discord.js';
import type { ExtendedClient } from '@/types/bot';
import { Logger, ErrorHandler } from '@/utils';
import { resolveComponent } from '@/interactions';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction): Promise<void> {
    const client = interaction.client as ExtendedClient;

    try {
      // 1. Autocomplete
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          await command.autocomplete(interaction);
        }
        return;
      }

      // 2. Slash commands
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          Logger.warn('Command not found', { commandName: interaction.commandName });
          return;
        }
        Logger.info('Command received', {
          command: interaction.commandName,
          user: interaction.user.tag,
          guild: interaction.guild?.name ?? 'DM',
        });
        await command.execute(interaction);
        return;
      }

      // 3. Composants (boutons, select menus, modals)
      if (
        interaction.isButton() ||
        interaction.isAnySelectMenu() ||
        interaction.isModalSubmit()
      ) {
        const component = resolveComponent(client.components, interaction.customId);
        if (!component) {
          Logger.warn('Component handler not found', { customId: interaction.customId });
          return;
        }
        Logger.info('Component received', {
          customId: interaction.customId,
          user: interaction.user.tag,
        });
        await component.execute(interaction);
        return;
      }
    } catch (error) {
      if (interaction.isRepliable()) {
        await ErrorHandler.handleInteractionError(
          error instanceof Error ? error : new Error(String(error)),
          interaction
        );
      } else {
        await ErrorHandler.handle(error instanceof Error ? error : new Error(String(error)));
      }
    }
  },
};
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

> Si `ErrorHandler.handleInteractionError` n'accepte pas un `RepliableInteraction`, vérifier sa signature dans `src/utils/errors.ts` et adapter le type du paramètre (le handler DVG accepte toute interaction répondable).

- [ ] **Step 3: Commit**

```bash
git add src/events/interactionCreate.ts
git commit -m "feat: add centralized interactionCreate router"
```

---

## Task 8 : Commande `/help` avec autocomplete

**Files:**
- Create: `src/commands/help.ts`
- Test: `tests/unit/commands/help.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

```typescript
// tests/unit/commands/help.test.ts
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
```

- [ ] **Step 2: Lancer le test pour vérifier l'échec**

Run: `npm run test:run -- tests/unit/commands/help.test.ts`
Expected: FAIL — `Cannot find module '@/commands/help'`

- [ ] **Step 3: Implémenter `/help`**

```typescript
// src/commands/help.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from 'discord.js';
import type { ExtendedClient, BotCommand } from '@/types/bot';
import { infoEmbed } from '@/utils';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Affiche la liste des commandes ou le détail de l’une d’elles')
  .addStringOption(opt =>
    opt
      .setName('commande')
      .setDescription('Nom d’une commande pour voir son détail')
      .setAutocomplete(true)
  );

const command: BotCommand = {
  data,

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const client = interaction.client as ExtendedClient;
    const focused = interaction.options.getFocused().toLowerCase();
    const choices = [...client.commands.values()]
      .map(cmd => cmd.data.name)
      .filter(name => name.startsWith(focused))
      .slice(0, 25)
      .map(name => ({ name, value: name }));
    await interaction.respond(choices);
  },

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const client = interaction.client as ExtendedClient;
    const target = interaction.options.getString('commande');

    if (target) {
      const cmd = client.commands.get(target);
      if (!cmd) {
        await interaction.reply({
          content: `Commande inconnue : \`${target}\``,
          ephemeral: true,
        });
        return;
      }
      const embed = infoEmbed(
        `/${cmd.data.name}`,
        cmd.data.description
      ).addFields({
        name: 'Autocomplete',
        value: cmd.autocomplete ? 'Oui' : 'Non',
        inline: true,
      });
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const list = [...client.commands.values()]
      .map(cmd => `**/${cmd.data.name}** — ${cmd.data.description}`)
      .join('\n');
    const embed = infoEmbed('📖 Commandes disponibles', list || 'Aucune commande.');
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;
```

- [ ] **Step 4: Lancer le test pour vérifier le succès**

Run: `npm run test:run -- tests/unit/commands/help.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/help.ts tests/unit/commands/help.test.ts
git commit -m "feat: add /help command with command-name autocomplete"
```

---

## Task 9 : Sondage `/poll` + boutons

**Files:**
- Create: `src/commands/poll.ts`
- Create: `src/interactions/buttons/poll.ts`

> `/poll` et son handler de boutons partagent un repository de sondages exporté
> par la commande pour rester l'unique source de vérité.

- [ ] **Step 1: Implémenter la commande `/poll`**

```typescript
// src/commands/poll.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Colors,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';
import { MemoryRepository } from '@/database/memoryRepository';

export interface Poll {
  id: string;
  question: string;
  yes: Set<string>;
  no: Set<string>;
}

/** Repository partagé entre la commande et le handler de boutons. */
export const pollRepository = new MemoryRepository<Poll>();

export function buildPollEmbed(poll: Poll): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle('📊 Sondage')
    .setDescription(poll.question)
    .addFields(
      { name: '✅ Oui', value: String(poll.yes.size), inline: true },
      { name: '❌ Non', value: String(poll.no.size), inline: true }
    );
}

const data = new SlashCommandBuilder()
  .setName('poll')
  .setDescription('Crée un sondage oui/non avec des boutons')
  .addStringOption(opt =>
    opt.setName('question').setDescription('La question du sondage').setRequired(true)
  );

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const poll: Poll = { id: interaction.id, question, yes: new Set(), no: new Set() };
    await pollRepository.set(poll.id, poll);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`poll:vote:yes:${poll.id}`)
        .setLabel('Oui')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`poll:vote:no:${poll.id}`)
        .setLabel('Non')
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [buildPollEmbed(poll)], components: [row] });
  },
};

export default command;
```

- [ ] **Step 2: Implémenter le handler de boutons**

```typescript
// src/interactions/buttons/poll.ts
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
    const [choice, pollId] = payload.split(':');
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
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/commands/poll.ts src/interactions/buttons/poll.ts
git commit -m "feat: add /poll command with button voting and live count"
```

---

## Task 10 : Retour `/feedback` + modal

**Files:**
- Create: `src/commands/feedback.ts`
- Create: `src/interactions/modals/feedback.ts`

- [ ] **Step 1: Implémenter la commande `/feedback`**

```typescript
// src/commands/feedback.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';
import { MemoryRepository } from '@/database/memoryRepository';

export interface Feedback {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

/** Repository partagé avec le handler de modal. */
export const feedbackRepository = new MemoryRepository<Feedback>();

const data = new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('Envoie un retour via un formulaire');

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
      .setCustomId('feedback:submit')
      .setTitle('Votre retour');

    const input = new TextInputBuilder()
      .setCustomId('content')
      .setLabel('Votre message')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(input)
    );

    await interaction.showModal(modal);
  },
};

export default command;
```

- [ ] **Step 2: Implémenter le handler de modal**

```typescript
// src/interactions/modals/feedback.ts
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
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
      ephemeral: true,
    });
  },
};

export default component;
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/commands/feedback.ts src/interactions/modals/feedback.ts
git commit -m "feat: add /feedback command with modal form submission"
```

---

## Task 11 : Menu `/menu` + select menu

**Files:**
- Create: `src/commands/menu.ts`
- Create: `src/interactions/selectMenus/menu.ts`

- [ ] **Step 1: Implémenter la commande `/menu`**

```typescript
// src/commands/menu.ts
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import type { BotCommand } from '@/types/bot';

const data = new SlashCommandBuilder()
  .setName('menu')
  .setDescription('Démonstration d’un menu de sélection');

const command: BotCommand = {
  data,
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const select = new StringSelectMenuBuilder()
      .setCustomId('menu:select')
      .setPlaceholder('Choisissez votre couleur préférée')
      .addOptions(
        { label: 'Rouge', value: 'rouge', emoji: '🔴' },
        { label: 'Vert', value: 'vert', emoji: '🟢' },
        { label: 'Bleu', value: 'bleu', emoji: '🔵' }
      );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    await interaction.reply({
      content: 'Sélectionnez une option :',
      components: [row],
      ephemeral: true,
    });
  },
};

export default command;
```

- [ ] **Step 2: Implémenter le handler de select menu**

```typescript
// src/interactions/selectMenus/menu.ts
import { MessageComponentInteraction, ModalSubmitInteraction } from 'discord.js';
import type { BotComponent } from '@/types/bot';

const component: BotComponent = {
  prefix: 'menu:select',
  async execute(
    interaction: MessageComponentInteraction | ModalSubmitInteraction
  ): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;

    const choice = interaction.values[0];
    await interaction.update({
      content: `Vous avez choisi : **${choice}**`,
      components: [],
    });
  },
};

export default component;
```

- [ ] **Step 3: Vérifier la compilation**

Run: `npm run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/commands/menu.ts src/interactions/selectMenus/menu.ts
git commit -m "feat: add /menu command with string select menu"
```

---

## Task 12 : Refactor `app.ts` (loader composants, crons registre, shutdown, Sentry)

**Files:**
- Modify: `src/app.ts`

- [ ] **Step 1: Initialiser `components` et le registre des crons**

Après `client.commands = new Collection<string, BotCommand>();` (ligne 28), ajouter :

```typescript
import type { BotCommand, BotComponent, ExtendedClient } from '@/types/bot';
// ... (compléter l'import existant avec BotComponent)

client.components = new Collection<string, BotComponent>();

/** Registre des crons actifs, pour les arrêter au shutdown. */
const activeCrons: CronJob[] = [];
```

Et compléter l'import `@/utils` pour inclure `initSentry` et `flushSentry`.

- [ ] **Step 2: Ajouter le loader de composants**

Ajouter cette fonction (à côté de `loadCommands`). Elle parcourt récursivement `src/interactions/{buttons,modals,selectMenus}` :

```typescript
async function loadComponents(): Promise<void> {
  const baseDir = join(__dirname, 'interactions');
  const subDirs = ['buttons', 'modals', 'selectMenus'];

  for (const sub of subDirs) {
    const dir = join(baseDir, sub);
    let files: string[];
    try {
      files = readdirSync(dir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    } catch {
      continue; // dossier optionnel
    }

    for (const file of files) {
      const filePath = join(dir, file);
      try {
        const mod = await import(filePath);
        const component = (mod.default || mod) as BotComponent;
        if ('prefix' in component && 'execute' in component) {
          client.components.set(component.prefix, component);
          Logger.info('Component loaded', { prefix: component.prefix });
        } else {
          Logger.warn('Invalid component structure', { file: filePath });
        }
      } catch (error) {
        await ErrorHandler.handle(
          new BotError(
            `Failed to load component: ${file}`,
            ErrorCode.INTERNAL_ERROR,
            { file },
            error instanceof Error ? error : undefined
          )
        );
      }
    }
  }
}
```

- [ ] **Step 3: Enregistrer les crons dans `activeCrons`**

Dans `loadCrons`, remplacer :

```typescript
          const job: CronJob = cron.execute(client);
          job.start();
```

par :

```typescript
          const job: CronJob = cron.execute(client);
          job.start();
          activeCrons.push(job);
```

- [ ] **Step 4: Supprimer le handler `interactionCreate` inline et le `ready` inline dupliqué**

Supprimer entièrement le bloc `client.on('interactionCreate', ...)` (lignes 143-173 de l'original) — il est remplacé par `events/interactionCreate.ts`.

Supprimer aussi le bloc `client.once('ready', ...)` (lignes 175-180) — `events/ready.ts` couvre déjà cet événement via l'auto-loader.

- [ ] **Step 5: Remplacer les handlers de shutdown basiques par un shutdown gracieux**

Remplacer les blocs `process.on('SIGINT', ...)` et `process.on('SIGTERM', ...)` (lignes 216-226 de l'original) par :

```typescript
const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  Logger.info('Shutting down gracefully', { signal });

  const hardExit = setTimeout(() => {
    Logger.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  hardExit.unref();

  for (const job of activeCrons) {
    job.stop();
  }

  await flushSentry();
  await client.destroy();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
```

- [ ] **Step 6: Initialiser Sentry et charger les composants au démarrage**

Dans la fonction `start()`, au tout début du `try` (avant `loadEvents()`), ajouter :

```typescript
    initSentry();
```

Et après `await loadCommands();`, ajouter :

```typescript
    await loadComponents();
```

- [ ] **Step 7: Vérifier la compilation et lancer toute la suite de tests**

Run: `npm run type-check && npm run test:run`
Expected: PASS — type-check sans erreur, tous les tests verts.

- [ ] **Step 8: Commit**

```bash
git add src/app.ts
git commit -m "refactor: central router, component loader, graceful shutdown, Sentry init"
```

---

## Task 13 : Docker

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

- [ ] **Step 1: Créer `.dockerignore`**

```
node_modules
dist
coverage
.git
.env
*.log
docs
tests
```

- [ ] **Step 2: Créer le `Dockerfile` multi-stage**

```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build
RUN npm prune --omit=dev

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package.json ./
# Utilisateur non-root
RUN addgroup -S botgroup && adduser -S botuser -G botgroup
USER botuser
CMD ["node", "dist/app.js"]
```

- [ ] **Step 3: Créer `docker-compose.yml`**

```yaml
services:
  discord-bot:
    build: .
    restart: unless-stopped
    env_file:
      - .env
    environment:
      NODE_ENV: production
```

- [ ] **Step 4: Vérifier la construction de l'image**

Run: `docker build -t discord-bot-template .`
Expected: build réussi jusqu'à l'étape finale (image taggée). Si Docker n'est pas disponible dans l'environnement, sauter cette vérification et le noter.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "build: add multi-stage Dockerfile and docker-compose"
```

---

## Task 14 : Documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md` (créer la section si le fichier existe ; sinon créer le fichier)

- [ ] **Step 1: Mettre à jour `CLAUDE.md`**

Dans la section "Architecture", après le paragraphe "File-based routing", ajouter :

```markdown
**Interactions:** Le routeur central `src/events/interactionCreate.ts` dispatche
les slash commands, l'autocomplete et les composants. Les composants (boutons,
modals, select menus) sont auto-chargés depuis `src/interactions/{buttons,modals,selectMenus}/`
et routés par préfixe de `customId` (convention `namespace:action[:payload]`).
Une commande peut exposer une méthode `autocomplete` (voir `src/commands/help.ts`).

**Persistance:** `src/database/repository.ts` définit l'interface `Repository<T>` ;
`MemoryRepository<T>` en fournit une implémentation mémoire. Remplacez-la par une
implémentation persistante sans toucher aux consommateurs.

**Observabilité:** `src/utils/sentry.ts` (Sentry optionnel, no-op sans `SENTRY_DSN`)
et `src/utils/sanitize.ts` (masquage des credentials dans logs/erreurs).

**Démos incluses:** `/help` (autocomplete), `/poll` (boutons + compteur live),
`/feedback` (modal), `/menu` (select menu).
```

Dans la section "Environment", ajouter la variable optionnelle :

```markdown
Variable optionnelle : `SENTRY_DSN` active le reporting d'erreurs Sentry.
```

- [ ] **Step 2: Mettre à jour `README.md`**

Ajouter une section (créer le fichier avec ce contenu s'il n'existe pas) :

```markdown
## Fonctionnalités démo

| Commande    | Démontre                                |
| ----------- | --------------------------------------- |
| `/help`     | Autocomplete dynamique + embed          |
| `/poll`     | Boutons + compteur live + persistance   |
| `/feedback` | Modal (formulaire) + persistance        |
| `/menu`     | Select menu                             |

## Docker

```bash
docker build -t discord-bot-template .
docker compose up -d
```

Variables d'environnement : voir `.env.example` (+ `SENTRY_DSN` optionnel).
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: document interactions, persistence, observability, Docker"
```

---

## Vérification finale

- [ ] **Lancer la validation complète**

Run: `npm run validate`
Expected: `type-check` + `lint` + `test:run` tous verts.

- [ ] **Vérifier qu'aucun TODO/placeholder ne traîne**

Run: `git grep -n "TODO\|FIXME" -- src/ || echo "Aucun"`
Expected: aucun placeholder introduit par ce plan.
