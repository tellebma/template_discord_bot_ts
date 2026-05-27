import { describe, it, expect } from 'vitest';
import { Collection } from 'discord.js';
import { componentKey, resolveComponent } from '@/interactions';
import type { BotComponent } from '@/types/bot';

const fake: BotComponent = { prefix: 'poll:vote', execute: async () => {} };

describe('componentKey', () => {
  it('garde les deux premiers segments', () => {
    expect(componentKey('poll:vote:yes')).toBe('poll:vote');
    expect(componentKey('feedback:submit')).toBe('feedback:submit');
  });
});

describe('resolveComponent', () => {
  const registry = new Collection<string, BotComponent>([['poll:vote', fake]]);

  it('résout par préfixe avec payload', () => {
    expect(resolveComponent(registry, 'poll:vote:yes')).toBe(fake);
  });

  it('retourne undefined si aucun handler', () => {
    expect(resolveComponent(registry, 'unknown:thing')).toBeUndefined();
  });
});
