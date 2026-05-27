/**
 * Contrat de persistance générique, indépendant du backend.
 *
 * Pour brancher une vraie base (PostgreSQL, MongoDB, Prisma...), créez une
 * classe qui implémente cette interface (ex: `PostgresRepository<T>`) et
 * injectez-la à la place de `MemoryRepository`. Les consommateurs ne changent
 * pas car ils dépendent de `Repository<T>`, pas de l'implémentation.
 */
export interface Repository<T> {
  get(id: string): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  set(id: string, value: T): Promise<void>;
  delete(id: string): Promise<boolean>;
}
