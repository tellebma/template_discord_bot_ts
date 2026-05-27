import type { Repository } from './repository';

/**
 * Implémentation en mémoire de {@link Repository}, basée sur une Map.
 *
 * Idéale pour le développement et les tests. Les données sont perdues au
 * redémarrage : remplacez-la par une implémentation persistante en production.
 */
export class MemoryRepository<T> implements Repository<T> {
  private readonly store = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.store.get(id);
  }

  async getAll(): Promise<T[]> {
    return [...this.store.values()];
  }

  async set(id: string, value: T): Promise<void> {
    this.store.set(id, value);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
