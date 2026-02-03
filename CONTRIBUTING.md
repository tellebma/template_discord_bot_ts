# Contributing Guide

Thank you for your interest in contributing to the Discord Bot Template! This guide will help you get started.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/discord-bot-template-ts.git
   cd discord-bot-template-ts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your bot credentials
   ```

4. **Verify setup**
   ```bash
   npm run validate
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes
- `chore/` - Maintenance tasks

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) specification.

#### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Other changes |
| `revert` | Revert a previous commit |

#### Examples

```bash
# Feature
git commit -m "feat(commands): add moderation kick command"

# Bug fix
git commit -m "fix(cooldown): correct time calculation for rate limiting"

# Breaking change
git commit -m "feat(api)!: change command handler signature

BREAKING CHANGE: Command handlers now receive a context object instead of raw interaction"

# With scope
git commit -m "docs(readme): update installation instructions"

# Without scope
git commit -m "chore: update dependencies"
```

## Code Style

### TypeScript

- Enable strict mode
- Use explicit types for function parameters and returns
- Prefer interfaces over type aliases for object shapes
- Use `readonly` for properties that shouldn't change

```typescript
// Good
interface UserData {
  readonly id: string;
  name: string;
  permissions: readonly string[];
}

function processUser(user: UserData): Promise<void> {
  // ...
}

// Avoid
function processUser(user: any) {
  // ...
}
```

### Error Handling

Always use the error handling system:

```typescript
import { CommandError, ValidationError, ErrorHandler } from '@/utils';

// Throw specific errors
if (!input) {
  throw new ValidationError('Input required', 'input', 'string');
}

// Handle errors properly
try {
  await riskyOperation();
} catch (error) {
  throw new CommandError(
    'Operation failed',
    'commandName',
    'User-friendly message',
    { context: 'value' },
    error instanceof Error ? error : undefined
  );
}
```

### Testing

Write tests for all new functionality:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockInteraction } from '../../mocks/discord';

describe('MyCommand', () => {
  let interaction: ReturnType<typeof mockInteraction>;

  beforeEach(() => {
    interaction = mockInteraction({ commandName: 'mycommand' });
  });

  it('should handle valid input', async () => {
    interaction.options.getString.mockReturnValue('valid');

    await myCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ content: expect.stringContaining('Success') })
    );
  });

  it('should handle errors gracefully', async () => {
    interaction.options.getString.mockReturnValue(null);

    await myCommand.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    );
  });
});
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```

3. **Run validation**
   ```bash
   npm run validate
   ```

4. **Push and create PR**
   ```bash
   git push origin feat/my-feature
   ```

5. **Fill out the PR template**
   - Describe what changes were made
   - Link related issues
   - Add screenshots if applicable

6. **Address review feedback**
   - Make requested changes
   - Push additional commits
   - Re-request review when ready

## Adding New Commands

1. Create a new file in `src/commands/`:

```typescript
// src/commands/mycommand.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { createStandardCommand } from '@/utils/commandTemplate';

const commandData = new SlashCommandBuilder()
  .setName('mycommand')
  .setDescription('Description of my command');

export default createStandardCommand({
  name: 'mycommand',
  description: 'Description of my command',
  category: 'utility',
  permissions: [],
  cooldown: 3,
  data: commandData,
  handler: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    await interaction.reply('Command executed!');
  },
});
```

2. Add tests in `tests/unit/commands/`:

```typescript
// tests/unit/commands/mycommand.test.ts
import { describe, it, expect } from 'vitest';
import { mockInteraction } from '../../mocks/discord';

describe('MyCommand', () => {
  it('should execute successfully', async () => {
    // Test implementation
  });
});
```

## Adding New Error Types

1. Add the error class in `src/utils/errors.ts`:

```typescript
export class MyCustomError extends BotError {
  public readonly customField: string;

  constructor(message: string, customField: string, context: ErrorContext = {}) {
    super(message, ErrorCode.CUSTOM_ERROR, context);
    this.name = 'MyCustomError';
    this.customField = customField;
  }

  override getUserMessage(): string {
    return 'A user-friendly error message';
  }
}
```

2. Add the error code in the `ErrorCode` enum
3. Add tests for the new error type
4. Update documentation

## Questions?

If you have questions, please:

1. Check existing issues and discussions
2. Open a new issue with the question label
3. Join our Discord server (if available)

Thank you for contributing!
