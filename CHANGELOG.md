## [1.1.1](https://github.com/tellebma/template_discord_bot_ts/compare/v1.1.0...v1.1.1) (2026-05-27)


### Code Refactoring

* replace deprecated ephemeral:true with flags: MessageFlags.Ephemeral ([3fd9a52](https://github.com/tellebma/template_discord_bot_ts/commit/3fd9a52533e6ee0ac6a87a8015f7e546efab1c4b))
* replace dynamic ephemeral reply option and generated code with MessageFlags ([a111911](https://github.com/tellebma/template_discord_bot_ts/commit/a111911b196e26e4ddf10cc0c3c5e049c5be04d2))

## [1.1.0](https://github.com/tellebma/template_discord_bot_ts/compare/v1.0.0...v1.1.0) (2026-05-27)


### Features

* add /feedback command with modal form submission ([116c35f](https://github.com/tellebma/template_discord_bot_ts/commit/116c35f933b93552fd2e21c255883fd3505c0362))
* add /help command with command-name autocomplete ([c540036](https://github.com/tellebma/template_discord_bot_ts/commit/c540036e9506a43fddb91350457e64888d0b495b))
* add /menu command with string select menu ([421b1f9](https://github.com/tellebma/template_discord_bot_ts/commit/421b1f92d78f38829140aeff482561a053baaba7))
* add /poll command with button voting and live count ([644f218](https://github.com/tellebma/template_discord_bot_ts/commit/644f2183b84d0a1c3e252aac09e7b0e887946f8e))
* add abstract Repository with in-memory implementation ([9a776ec](https://github.com/tellebma/template_discord_bot_ts/commit/9a776ecee659aea5f5df5352a35ceb4355a4d640))
* add centralized interactionCreate router ([1e0106a](https://github.com/tellebma/template_discord_bot_ts/commit/1e0106a6a24d6d40a9fa1444edf5dbece6a39b49))
* add component registry resolution by customId prefix ([53fd318](https://github.com/tellebma/template_discord_bot_ts/commit/53fd31864fd94727cbf5d9765e5cc7ed9f33bd46))
* add credential sanitization utility ([9b7e667](https://github.com/tellebma/template_discord_bot_ts/commit/9b7e6678fbaacd6220b122d7772ff13e9ff85c8b))
* add optional Sentry integration (no-op without DSN) ([23dc733](https://github.com/tellebma/template_discord_bot_ts/commit/23dc73319dd2ac10fed00142a2ce9286c81e657d))
* add reusable embeds, component types, and util re-exports ([72b77af](https://github.com/tellebma/template_discord_bot_ts/commit/72b77afe707dd431d26628229f87c0e7897ec76a))
* wire sanitize into error logs and Sentry capture into ErrorHandler, add demo cron ([f0c26b1](https://github.com/tellebma/template_discord_bot_ts/commit/f0c26b11ba54daf8176768a7481cc3fc259e67df))


### Bug Fixes

* correct eslint-disable rule name for require in sentry ([415bd75](https://github.com/tellebma/template_discord_bot_ts/commit/415bd750e56e17d82e1ec516d1466933eb7308f8))
* harden sanitize token regex and tests, document mutation ([187e62f](https://github.com/tellebma/template_discord_bot_ts/commit/187e62f4fc9da3cd4b734e8ec9eb14654e76d835))


### Code Refactoring

* accept any repliable interaction in handleInteractionError ([ff18268](https://github.com/tellebma/template_discord_bot_ts/commit/ff18268eb15abc65f02b4bfcea9b60e9eb60818a))
* central router via events, full component loader, graceful shutdown, Sentry init ([10948a4](https://github.com/tellebma/template_discord_bot_ts/commit/10948a494c7ae4452330c6f151b5bb6ac4f85e8e))


### Documentation

* design portage bonnes pratiques DVG + features demo ([42c3325](https://github.com/tellebma/template_discord_bot_ts/commit/42c3325d82dfc9fa738677a94970ac074b00cf6e))
* document interactions, persistence, observability, and Docker ([b49c09b](https://github.com/tellebma/template_discord_bot_ts/commit/b49c09bd4e18b8f306b5b0d80cd742a464b06650))
* list new path aliases in CLAUDE.md ([d364f31](https://github.com/tellebma/template_discord_bot_ts/commit/d364f31e17ecf85a77009215f66603dc86a25b04))
* plan implementation portage bonnes pratiques DVG ([8099a7d](https://github.com/tellebma/template_discord_bot_ts/commit/8099a7d4e8b23f6e7b10ee37fd7576a3f391c2c7))

## 1.0.0 (2026-02-03)


### Features

* add CI/CD, testing infrastructure, and error handling system ([04f6825](https://github.com/tellebma/template_discord_bot_ts/commit/04f682560e04806510472c2a1e888c18e5da5c2a))
* **commands:** add simplified defineCommand API ([30839a5](https://github.com/tellebma/template_discord_bot_ts/commit/30839a53e6c15d2ee24927ea4a7c3864e57b1257))


### Bug Fixes

* correct error test assertions ([de58f1c](https://github.com/tellebma/template_discord_bot_ts/commit/de58f1cd1459c0bca4fb4b0dfd3b1b60c876299d))
* resolve TypeScript and ESLint errors ([391a53e](https://github.com/tellebma/template_discord_bot_ts/commit/391a53e427c2a856fa42b84b7e5491b5c9c7d43d))
