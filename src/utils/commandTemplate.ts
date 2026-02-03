import type {
  CommandConfig,
  CommandParameter,
  ValidationResult,
  ParameterValidator,
  LogContext,
  AnySlashCommandBuilder,
} from '@/types/bot';
import { Logger } from '@/utils/logger';
import type { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

export const ParameterValidators: Record<string, ParameterValidator> = {
  string: (value: unknown, options: unknown = {}): boolean => {
    if (typeof value !== 'string') return false;
    const opts = options as Record<string, unknown>;
    if (opts['minLength'] && value.length < (opts['minLength'] as number)) return false;
    if (opts['maxLength'] && value.length > (opts['maxLength'] as number)) return false;
    if (opts['pattern'] && !(opts['pattern'] as RegExp).test(value)) return false;
    return true;
  },

  integer: (value: unknown, options: unknown = {}): boolean => {
    if (!Number.isInteger(value)) return false;
    const opts = options as Record<string, unknown>;
    if (opts['min'] !== undefined && (value as number) < (opts['min'] as number)) return false;
    if (opts['max'] !== undefined && (value as number) > (opts['max'] as number)) return false;
    return true;
  },

  number: (value: unknown, options: unknown = {}): boolean => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    const opts = options as Record<string, unknown>;
    if (opts['min'] !== undefined && value < (opts['min'] as number)) return false;
    if (opts['max'] !== undefined && value > (opts['max'] as number)) return false;
    return true;
  },

  boolean: (value: unknown): boolean => typeof value === 'boolean',

  user: (value: unknown): boolean =>
    value !== null && typeof value === 'object' && 'id' in (value as Record<string, unknown>),

  channel: (value: unknown): boolean =>
    value !== null && typeof value === 'object' && 'id' in (value as Record<string, unknown>),

  role: (value: unknown): boolean =>
    value !== null && typeof value === 'object' && 'id' in (value as Record<string, unknown>),

  mentionable: (value: unknown): boolean =>
    value !== null && typeof value === 'object' && 'id' in (value as Record<string, unknown>),

  attachment: (value: unknown): boolean =>
    value !== null && typeof value === 'object' && 'url' in (value as Record<string, unknown>),
};

export class CommandTemplate {
  public readonly name: string;
  public readonly description: string;
  public readonly category: string;
  public readonly permissions: string[];
  public readonly cooldown: number;
  public readonly parameters: CommandParameter[];
  private readonly handler: CommandConfig['handler'];
  private static cooldowns = new Map<string, number>();

  constructor(config: CommandConfig) {
    this.name = config.name;
    this.description = config.description;
    this.category = config.category ?? 'general';
    this.permissions = config.permissions ?? [];
    this.cooldown = config.cooldown ?? 0;
    this.parameters = config.parameters ?? [];
    this.handler = config.handler;

    if (!this.name || !this.description || !this.handler) {
      throw new Error('Command template requires name, description, and handler');
    }
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const startTime = Date.now();

    try {
      Logger.info(`Command executed: ${this.name}`, {
        command: this.name,
        user: interaction.user.tag,
        guild: interaction.guild?.name ?? 'DM',
        channel: interaction.channel?.id ?? 'DM',
      } as LogContext);

      if (!this.validatePermissions(interaction)) {
        await interaction.reply({
          content: 'You do not have permission to use this command.',
          ephemeral: true,
        });
        return;
      }

      if (!this.checkCooldown(interaction)) {
        await interaction.reply({
          content: 'Please wait before using this command again.',
          ephemeral: true,
        });
        return;
      }

      const validatedParams = this.validateParameters(interaction);
      if (!validatedParams.valid) {
        await interaction.reply({
          content: `Invalid parameters: ${validatedParams.error ?? 'Unknown error'}`,
          ephemeral: true,
        });
        return;
      }

      await this.handler(interaction, validatedParams.params ?? {});

      const executionTime = Date.now() - startTime;
      Logger.info(`Command completed: ${this.name}`, {
        command: this.name,
        executionTime: `${executionTime}ms`,
        success: true,
      } as LogContext);
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      Logger.error(`Command error: ${this.name}`, {
        command: this.name,
        error: errorMessage,
        stack: errorStack,
        executionTime: `${executionTime}ms`,
        success: false,
      } as LogContext);

      const replyMessage = {
        content: 'An error occurred while executing this command.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyMessage);
      } else {
        await interaction.reply(replyMessage);
      }
    }
  }

  private validatePermissions(interaction: ChatInputCommandInteraction): boolean {
    if (this.permissions.length === 0) return true;

    if (!interaction.member || !('permissions' in interaction.member)) return false;

    const memberPermissions = interaction.member.permissions;
    if (typeof memberPermissions === 'string') return false;

    return this.permissions.every(permission =>
      memberPermissions.has(permission as PermissionResolvable)
    );
  }

  private checkCooldown(interaction: ChatInputCommandInteraction): boolean {
    if (this.cooldown === 0) return true;

    const cooldownKey = `${this.name}_${interaction.user.id}`;
    const lastUsed = CommandTemplate.cooldowns.get(cooldownKey) ?? 0;
    const now = Date.now();

    if (now - lastUsed < this.cooldown * 1000) {
      return false;
    }

    CommandTemplate.cooldowns.set(cooldownKey, now);
    return true;
  }

  private validateParameters(interaction: ChatInputCommandInteraction): ValidationResult {
    const params: Record<string, unknown> = {};

    for (const param of this.parameters) {
      const option = interaction.options.get(param.name);
      const value = option?.value;

      if (param.required && (value === undefined || value === null)) {
        return {
          valid: false,
          error: `Parameter '${param.name}' is required`,
        };
      }

      if (value !== undefined && value !== null) {
        const validator = ParameterValidators[param.type];
        if (validator && !validator(value, param.validation)) {
          return {
            valid: false,
            error: `Parameter '${param.name}' is invalid`,
          };
        }
        params[param.name] = value;
      }
    }

    return { valid: true, params };
  }
}

export function createStandardCommand(config: CommandConfig): {
  data: AnySlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
} {
  const template = new CommandTemplate(config);

  return {
    data: config.data,
    execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
      await template.execute(interaction);
    },
  };
}
