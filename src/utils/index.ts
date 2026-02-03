/**
 * Utility modules exports
 */
export { Logger, LogLevel } from './logger';
export { config, validateConfig } from './config';
export {
  defineCommand,
  simpleCommand,
  type CommandOptions,
  type CommandContext,
} from './defineCommand';
export {
  // Error classes
  BotError,
  CommandError,
  ValidationError,
  PermissionError,
  CooldownError,
  ConfigurationError,
  ExternalServiceError,
  // Enums
  ErrorCode,
  ErrorSeverity,
  // Handler
  ErrorHandler,
  // Helpers
  errorMiddleware,
  createError,
  // Types
  type ErrorContext,
  type ErrorHandlerFn,
  type ErrorHandleResult,
} from './errors';
