import { describe, it, expect } from 'vitest';
import { sanitizeMessage, sanitizeError } from '@/utils/sanitize';

describe('sanitizeMessage', () => {
  it('masque une URL de connexion postgres', () => {
    const out = sanitizeMessage('connect postgres://user:pass@host:5432/db now');
    expect(out).not.toContain('pass');
    expect(out).toContain('[REDACTED]');
  });

  it('masque un token Discord (Bot ...)', () => {
    const out = sanitizeMessage('Authorization: Bot MTExMjM0NTY3ODkwMTIz.Gc5678.abc-defghijklmno');
    expect(out).toBe('Authorization: [REDACTED]');
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
    expect(cleaned.stack ?? '').not.toContain('pass');
  });
});
