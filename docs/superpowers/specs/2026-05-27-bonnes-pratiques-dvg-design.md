# Design — Portage des bonnes pratiques DVG + fonctionnalités démo

**Date :** 2026-05-27
**Statut :** Approuvé (design)
**Référence source :** `/home/tellebma/DEV/DVG/discord-js-dvg`

## Objectif

Reprendre dans ce template les bonnes pratiques éprouvées du bot DVG, et ajouter
des fonctionnalités de démonstration qui montrent l'éventail des possibilités de
discord.js v14 — sans importer le code métier spécifique à DVG (PostgreSQL réel,
Gemini, transcription vocale, HelloAsso, SonarQube/Semgrep).

Le template doit rester **pédagogique, léger et générique**.

## Périmètre

### Inclus

1. **Routeur d'interactions centralisé** — un seul `events/interactionCreate.ts`
   qui dispatche commandes, autocomplete, boutons, modals et select menus.
2. **Composants auto-chargés** — `src/interactions/{buttons,modals,selectMenus}/`,
   routés par préfixe de `customId`.
3. **Persistance abstraite** — interface `Repository<T>` + `MemoryRepository<T>`
   (impl. en mémoire), avec commentaires montrant où brancher une vraie DB.
4. **Fonctionnalités démo** :
   - `/help [commande]` — autocomplete dynamique + embed détaillé.
   - `/poll` — sondage avec boutons de vote et compteur live (persistance).
   - `/feedback` — modal (formulaire) stocké via repository.
   - `/menu` — select menu de démonstration.
5. **Infra & robustesse** :
   - Shutdown gracieux complet (SIGINT/SIGTERM → stop crons, destroy client,
     timeout dur `unref()`).
   - Sentry optionnel (`utils/sentry.ts`, no-op sans DSN) + `utils/sanitize.ts`
     (scrubbing des credentials), branchés dans Logger/ErrorHandler.
   - Docker multi-stage (user non-root) + `docker-compose.yml`.
6. **Utilitaire embeds réutilisables** (`utils/embeds.ts` : success/error/info).
7. **Tests** Vitest + mise à jour `CLAUDE.md` / `README`.

### Exclu (mentionné en commentaires « pour aller plus loin »)

PostgreSQL réel, migrations, Gemini/Speech, voice recording, HelloAsso,
SonarQube/Semgrep en CI.

## Architecture

```
src/
├── app.ts                        REFACTOR — shutdown gracieux, init Sentry,
│                                  registre des crons pour stop propre
├── events/
│   ├── ready.ts                  (existant)
│   └── interactionCreate.ts      NEW — routeur central (remplace le handler inline)
├── interactions/                 NEW — composants auto-chargés
│   ├── index.ts                  (registre + loader, routing par préfixe customId)
│   ├── buttons/poll.ts           (handler "poll:vote")
│   ├── modals/feedback.ts        (handler "feedback:submit")
│   └── selectMenus/menu.ts       (handler "menu:select")
├── commands/
│   ├── help.ts                   NEW — autocomplete + embed
│   ├── poll.ts                   NEW — boutons + persistance
│   ├── feedback.ts               NEW — ouvre un modal
│   ├── menu.ts                   NEW — select menu
│   └── (existantes inchangées)
├── database/                     NEW
│   ├── repository.ts             (interface Repository<T>)
│   └── memoryRepository.ts       (impl. Map)
├── utils/
│   ├── embeds.ts                 NEW
│   ├── sentry.ts                 NEW
│   ├── sanitize.ts               NEW
│   └── (existants : errors, logger, config, defineCommand, ...)
└── crons/                        (existant)
```

## Détails des composants

### Routeur `interactionCreate.ts`

Remplace le handler inline actuel de `app.ts` (lignes 143-173). Dispatch :

- `isChatInputCommand()` → `client.commands.get(name).execute(interaction)`
- `isAutocomplete()` → `command.autocomplete?.(interaction)`
- `isButton()` / `isModalSubmit()` / `isStringSelectMenu()` → résolution du
  handler par préfixe de `customId` via le registre `interactions/`.

Logging centralisé de chaque interaction + gestion d'erreur unifiée via
`ErrorHandler.handleInteractionError`.

### Registre des composants (`interactions/index.ts`)

`customId` au format `"namespace:action[:payload]"`. Le registre indexe par
`"namespace:action"`. Auto-chargement récursif des fichiers de
`buttons/`, `modals/`, `selectMenus/`, chacun exportant
`{ prefix: string, execute(interaction): Promise<void> }`.

### Persistance

```ts
interface Repository<T> {
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  set(id: string, value: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}
```

`MemoryRepository<T>` implémente l'interface avec une `Map`. Commentaire en tête
indiquant comment substituer une impl. Postgres/Mongo/Prisma sans toucher aux
consommateurs.

### Types `BotCommand`

Étendre l'interface pour rendre `autocomplete?` officiel (déjà supporté de facto
dans DVG).

### Sentry & sanitize

- `sentry.ts` : `initSentry()` (appelé au démarrage, no-op si pas de `SENTRY_DSN`),
  `captureError()`, `flushSentry()` (appelé au shutdown). `beforeSend` passe par
  `sanitize`.
- `sanitize.ts` : `sanitizeMessage()` (masque tokens Discord, URLs de connexion)
  et `sanitizeError()`. Branché dans `Logger.error` et `ErrorHandler.handle`.

### Shutdown gracieux (`app.ts`)

Fonction `shutdown(signal)` : log, stop des `CronJob` enregistrés, `flushSentry()`,
`client.destroy()`, `process.exit(0)`. Timeout dur via `setTimeout(...).unref()`
pour forcer la sortie si le flush traîne. Garder les `CronJob` créés dans un tableau
au niveau module pour pouvoir les arrêter.

## Flux de données — exemple `/poll`

1. `/poll question:"..."` → crée un `Poll` (id, question, votes) stocké dans le
   `MemoryRepository<Poll>`, répond avec un embed + 2 boutons (`poll:vote:yes`,
   `poll:vote:no`).
2. Clic bouton → handler `interactions/buttons/poll.ts` lit le payload (`yes`/`no`),
   met à jour le `Poll` dans le repo, édite l'embed avec le nouveau compteur.

## Gestion d'erreurs

Tous les handlers d'interaction sont enveloppés par le routeur central qui délègue
à `ErrorHandler.handleInteractionError`. Les composants n'ont pas à gérer le
try/catch de plus haut niveau eux-mêmes.

## Tests

- `memoryRepository.test.ts` — CRUD complet.
- `sanitize.test.ts` — masquage tokens/URLs de connexion.
- `interactions.test.ts` — résolution d'un handler par préfixe de customId.
- `help.test.ts` — autocomplete renvoie les commandes filtrées.

Seuil de couverture inchangé (70 %).

## Docker

- `Dockerfile` multi-stage (build → prod), user non-root, `npm ci`, `npm run build`.
- `docker-compose.yml` minimal lançant le bot (variables via `.env`).

## Documentation

Mise à jour de `CLAUDE.md` (nouveaux dossiers/patterns) et `README` (section
fonctionnalités démo + Docker).
```
