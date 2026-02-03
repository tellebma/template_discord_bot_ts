import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BotError,
  CommandError,
  ValidationError,
  PermissionError,
  CooldownError,
  ConfigurationError,
  ExternalServiceError,
  ErrorCode,
  ErrorHandler,
  errorMiddleware,
} from '@/utils/errors';
import { mockInteraction } from '../../mocks/discord';

describe('Error Classes', () => {
  describe('BotError', () => {
    it('should create a base error with correct properties', () => {
      const error = new BotError('Test error', ErrorCode.UNKNOWN_ERROR);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(error.name).toBe('BotError');
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.isOperational).toBe(true);
    });

    it('should include context when provided', () => {
      const context = { userId: '123', action: 'test' };
      const error = new BotError('Test error', ErrorCode.UNKNOWN_ERROR, context);

      expect(error.context).toEqual(context);
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original');
      const error = new BotError('Wrapped error', ErrorCode.UNKNOWN_ERROR, {}, originalError);

      expect(error.originalError).toBe(originalError);
    });

    it('should serialize to JSON correctly', () => {
      const error = new BotError('Test error', ErrorCode.UNKNOWN_ERROR, { test: true });
      const json = error.toJSON();

      expect(json).toMatchObject({
        name: 'BotError',
        message: 'Test error',
        code: ErrorCode.UNKNOWN_ERROR,
        context: { test: true },
        isOperational: true,
      });
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('CommandError', () => {
    it('should create command error with command name', () => {
      const error = new CommandError('Command failed', 'ping');

      expect(error.message).toBe('Command failed');
      expect(error.code).toBe(ErrorCode.COMMAND_EXECUTION_ERROR);
      expect(error.commandName).toBe('ping');
      expect(error.name).toBe('CommandError');
    });

    it('should include user-friendly message', () => {
      const error = new CommandError('Internal error', 'test', 'Something went wrong');

      expect(error.userMessage).toBe('Something went wrong');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field info', () => {
      const error = new ValidationError('Invalid input', 'username');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.field).toBe('username');
      expect(error.name).toBe('ValidationError');
    });

    it('should include expected value info', () => {
      const error = new ValidationError('Invalid type', 'age', 'number');

      expect(error.expected).toBe('number');
    });
  });

  describe('PermissionError', () => {
    it('should create permission error with required permissions', () => {
      const error = new PermissionError(['Administrator', 'ManageGuild']);

      expect(error.message).toContain('Missing required permissions');
      expect(error.code).toBe(ErrorCode.PERMISSION_DENIED);
      expect(error.requiredPermissions).toEqual(['Administrator', 'ManageGuild']);
      expect(error.name).toBe('PermissionError');
    });
  });

  describe('CooldownError', () => {
    it('should create cooldown error with remaining time', () => {
      const error = new CooldownError(5, 'ping');

      expect(error.message).toContain('5');
      expect(error.code).toBe(ErrorCode.COOLDOWN_ACTIVE);
      expect(error.remainingTime).toBe(5);
      expect(error.commandName).toBe('ping');
      expect(error.name).toBe('CooldownError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Missing API key', 'API_KEY');

      expect(error.message).toBe('Missing API key');
      expect(error.code).toBe(ErrorCode.CONFIGURATION_ERROR);
      expect(error.configKey).toBe('API_KEY');
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError('API request failed', 'Discord API', 500);

      expect(error.message).toBe('API request failed');
      expect(error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR);
      expect(error.serviceName).toBe('Discord API');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ExternalServiceError');
    });
  });
});

describe('ErrorHandler', () => {
  let loggerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    ErrorHandler.clearHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('handle', () => {
    it('should handle BotError correctly', async () => {
      const error = new CommandError('Test error', 'ping');
      const result = await ErrorHandler.handle(error);

      expect(result.handled).toBe(true);
      expect(result.error.message).toBe(error.message);
      expect(result.error.code).toBe(error.code);
    });

    it('should wrap non-BotError in BotError', async () => {
      const error = new Error('Regular error');
      const result = await ErrorHandler.handle(error);

      expect(result.handled).toBe(true);
      expect(result.error).toBeInstanceOf(BotError);
    });

    it('should call registered handlers', async () => {
      const handler = vi.fn();
      ErrorHandler.registerHandler(handler);

      const error = new BotError('Test', ErrorCode.UNKNOWN_ERROR);
      await ErrorHandler.handle(error);

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test',
          code: ErrorCode.UNKNOWN_ERROR,
        })
      );
    });
  });

  describe('handleInteractionError', () => {
    it('should reply to interaction with error message', async () => {
      const interaction = mockInteraction();
      const error = new CommandError('Failed', 'ping', 'Something went wrong');

      await ErrorHandler.handleInteractionError(error, interaction);

      expect(interaction.reply).toHaveBeenCalledWith(
        expect.objectContaining({
          ephemeral: true,
        })
      );
    });

    it('should use followUp if interaction already replied', async () => {
      const interaction = mockInteraction({ replied: true });
      const error = new CommandError('Failed', 'ping');

      await ErrorHandler.handleInteractionError(error, interaction);

      expect(interaction.followUp).toHaveBeenCalled();
    });

    it('should use followUp if interaction is deferred', async () => {
      const interaction = mockInteraction({ deferred: true });
      const error = new CommandError('Failed', 'ping');

      await ErrorHandler.handleInteractionError(error, interaction);

      expect(interaction.followUp).toHaveBeenCalled();
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      const error = new ValidationError('Invalid', 'field');
      expect(ErrorHandler.isOperationalError(error)).toBe(true);
    });

    it('should return false for programming errors', () => {
      const error = new TypeError('Cannot read property of undefined');
      expect(ErrorHandler.isOperationalError(error)).toBe(false);
    });
  });
});

describe('errorMiddleware', () => {
  it('should wrap function and handle errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Test error'));
    const interaction = mockInteraction();
    const wrapped = errorMiddleware(fn);

    await wrapped(interaction);

    expect(interaction.reply).toHaveBeenCalled();
  });

  it('should not interfere with successful execution', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const interaction = mockInteraction();
    const wrapped = errorMiddleware(fn);

    await wrapped(interaction);

    expect(fn).toHaveBeenCalledWith(interaction);
    expect(interaction.reply).not.toHaveBeenCalled();
  });
});
