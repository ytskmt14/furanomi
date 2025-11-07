/**
 * React Query Configuration
 * Centralizes QueryClient setup and default options
 */

import { QueryClient } from '@tanstack/react-query';
import { CACHE_TTL } from '../constants/ui';

/**
 * Create and configure the QueryClient instance
 * Applied to all queries and mutations unless overridden
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for this duration
       * After stale, background refetch will occur on re-focus or interval
       */
      staleTime: CACHE_TTL.SHOP_FEATURES || 5 * 60 * 1000, // 5 minutes

      /**
       * How long cached data is kept in memory after last use
       * After this, the query will be garbage collected
       */
      gcTime: 10 * 60 * 1000, // 10 minutes

      /**
       * Number of retry attempts on failure
       */
      retry: 1,

      /**
       * Delay before retrying failed queries (ms)
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      /**
       * Refetch on window focus
       * User returns to tab -> data automatically refreshes
       */
      refetchOnWindowFocus: true,

      /**
       * Refetch on reconnect
       * User regains internet connection -> data automatically refreshes
       */
      refetchOnReconnect: true,

      /**
       * Refetch on mount only if data is stale
       */
      refetchOnMount: false,
    },

    mutations: {
      /**
       * Number of retry attempts on mutation failure
       */
      retry: 1,

      /**
       * Delay before retrying failed mutations
       */
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
