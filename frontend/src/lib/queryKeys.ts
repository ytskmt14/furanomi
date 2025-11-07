/**
 * Query Key Factory for React Query
 * Centralizes and organizes all query keys for consistent cache invalidation
 */

/**
 * Query key factory following TanStack Query best practices
 * Hierarchical structure for easy cache invalidation
 */
export const queryKeys = {
  /**
   * Shops queries
   */
  shops: {
    all: ['shops'] as const,
    lists: () => [...queryKeys.shops.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.shops.lists(), { filters }] as const,
    details: () => [...queryKeys.shops.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shops.details(), id] as const,
    features: (id: string) => [...queryKeys.shops.detail(id), 'features'] as const,
    myShop: () => [...queryKeys.shops.all, 'myShop'] as const,
    managers: () => [...queryKeys.shops.all, 'managers'] as const,
  },

  /**
   * Favorites queries
   */
  favorites: {
    all: ['favorites'] as const,
    lists: () => [...queryKeys.favorites.all, 'list'] as const,
  },

  /**
   * Shop Managers queries
   */
  managers: {
    all: ['managers'] as const,
    lists: () => [...queryKeys.managers.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.managers.all, id] as const,
  },

  /**
   * Reservations queries
   */
  reservations: {
    all: ['reservations'] as const,
    lists: () => [...queryKeys.reservations.all, 'list'] as const,
    list: (shopId: string) =>
      [...queryKeys.reservations.lists(), shopId] as const,
    detail: (id: string) => [...queryKeys.reservations.all, id] as const,
  },

  /**
   * User queries
   */
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    auth: () => [...queryKeys.user.all, 'auth'] as const,
  },

  /**
   * System Admin / Dashboard queries
   */
  admin: {
    all: ['admin'] as const,
    dashboard: () => [...queryKeys.admin.all, 'dashboard'] as const,
    stats: () => [...queryKeys.admin.dashboard(), 'stats'] as const,
  },
};
