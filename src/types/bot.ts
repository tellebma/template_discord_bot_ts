import {
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';

/**
 * Any slash command builder type
 */
export type AnySlashCommandBuilder =
  | SlashCommandBuilder
  | SlashCommandOptionsOnlyBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export interface BotCommand {
  data: AnySlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ExtendedClient extends Client {
  commands: Collection<string, BotCommand>;
}

export interface CommandConfig {
  name: string;
  description: string;
  category?: string;
  permissions?: string[];
  cooldown?: number;
  data: AnySlashCommandBuilder;
  parameters?: CommandParameter[];
  handler: CommandHandler;
}

export interface CommandParameter {
  type: ParameterType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ParameterChoice[];
  validation?: ParameterValidation;
}

export interface ParameterChoice {
  name: string;
  value: string | number;
}

export interface ParameterValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

export type ParameterType =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'user'
  | 'channel'
  | 'role'
  | 'mentionable'
  | 'attachment';

export type CommandHandler = (
  interaction: ChatInputCommandInteraction,
  params: Record<string, unknown>
) => Promise<void>;

export interface LogContext {
  [key: string]: unknown;
}

export interface ConfigType {
  discord: {
    token: string;
    clientId: string;
  };
  bot: {
    prefix: string;
    isDevelopment: boolean;
  };
}

export interface ValidationResult {
  valid: boolean;
  params?: Record<string, unknown>;
  error?: string;
}

export interface ParameterValidator {
  (value: unknown, options?: unknown): boolean;
}

export interface CommandCooldown {
  userId: string;
  commandName: string;
  timestamp: number;
}
