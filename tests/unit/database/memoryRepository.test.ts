import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRepository } from '@/database/memoryRepository';

interface Item {
  id: string;
  label: string;
}

describe('MemoryRepository', () => {
  let repo: MemoryRepository<Item>;

  beforeEach(() => {
    repo = new MemoryRepository<Item>();
  });

  it('stocke et récupère une entité', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    expect(await repo.get('1')).toEqual({ id: '1', label: 'a' });
  });

  it('retourne undefined pour une clé absente', async () => {
    expect(await repo.get('nope')).toBeUndefined();
  });

  it('liste toutes les entités', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    await repo.set('2', { id: '2', label: 'b' });
    expect(await repo.getAll()).toHaveLength(2);
  });

  it('supprime une entité et signale le résultat', async () => {
    await repo.set('1', { id: '1', label: 'a' });
    expect(await repo.delete('1')).toBe(true);
    expect(await repo.delete('1')).toBe(false);
    expect(await repo.get('1')).toBeUndefined();
  });
});
