import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel } from '@/utils/logger';

describe('Logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('log levels', () => {
    it('should log info messages with correct format', () => {
      Logger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput).toMatchObject({
        level: 'INFO',
        message: 'Test message',
      });
      expect(logOutput.timestamp).toBeDefined();
    });

    it('should log warn messages with correct format', () => {
      Logger.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput).toMatchObject({
        level: 'WARN',
        message: 'Warning message',
      });
    });

    it('should log error messages with correct format', () => {
      Logger.error('Error message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput).toMatchObject({
        level: 'ERROR',
        message: 'Error message',
      });
    });

    it('should log debug messages only in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      Logger.debug('Debug message');

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput).toMatchObject({
        level: 'DEBUG',
        message: 'Debug message',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      Logger.debug('Debug message');

      expect(consoleSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('context handling', () => {
    it('should include context in log output', () => {
      Logger.info('Test with context', {
        userId: '123',
        guildId: '456',
        action: 'test',
      });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput).toMatchObject({
        level: 'INFO',
        message: 'Test with context',
        userId: '123',
        guildId: '456',
        action: 'test',
      });
    });

    it('should handle empty context', () => {
      Logger.info('No context');

      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput.level).toBe('INFO');
      expect(logOutput.message).toBe('No context');
    });

    it('should handle complex nested context', () => {
      Logger.info('Nested context', {
        user: { id: '123', name: 'Test' },
        metadata: { nested: { value: true } },
      });

      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);

      expect(logOutput.user).toEqual({ id: '123', name: 'Test' });
      expect(logOutput.metadata).toEqual({ nested: { value: true } });
    });
  });

  describe('timestamp format', () => {
    it('should include ISO formatted timestamp', () => {
      Logger.info('Timestamp test');

      const logOutput = JSON.parse(consoleSpy.mock.calls[0]?.[0] as string);
      const timestamp = new Date(logOutput.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct enum values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
    });
  });
});
