/**
 * Masque les secrets (URLs de connexion, tokens) avant de les écrire dans les
 * logs ou de les envoyer à un service externe (Sentry).
 */
const PATTERNS: RegExp[] = [
  // URLs de connexion type postgres://user:pass@host:port/db
  /\b(?:postgres|postgresql|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s'"]+/gi,
  // Tokens Discord (entête Authorization: Bot <token>)
  /\bBot\s+[A-Za-z0-9._-]{10,}/g,
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
