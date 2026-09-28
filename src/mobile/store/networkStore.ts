import { useState, useEffect } from 'react';
import { sqliteDb, OfflineAttemptRecord } from '../db/sqlite.ts';
import { api } from '../services/api/client.ts';

let isOnlineState: boolean = true;
let isSyncingState: boolean = false;
let pendingAttemptsState: OfflineAttemptRecord[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function useNetwork() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    // Initial fetch of pending
    pendingAttemptsState = sqliteDb.getPendingAttempts();
    notify();

    return () => {
      listeners.delete(update);
    };
  }, []);

  const toggleNetwork = () => {
    isOnlineState = !isOnlineState;
    if (isOnlineState) {
      // Auto-trigger sync when back online
      syncOfflineAttempts();
    }
    notify();
  };

  const setNetworkStatus = (online: boolean) => {
    isOnlineState = online;
    if (online) {
      syncOfflineAttempts();
    }
    notify();
  };

  const refreshPending = () => {
    pendingAttemptsState = sqliteDb.getPendingAttempts();
    notify();
  };

  const syncOfflineAttempts = async (): Promise<{ syncedCount: number }> => {
    if (!isOnlineState) return { syncedCount: 0 };
    const pending = sqliteDb.getPendingAttempts();
    if (pending.length === 0) return { syncedCount: 0 };

    isSyncingState = true;
    notify();

    try {
      const response = await api.post('/sync/attempts', {
        offlineAttempts: pending,
      });

      if (response.success && response.data?.results) {
        const syncedIds = response.data.results
          .filter((r: any) => r.status === 'synced')
          .map((r: any) => r.localId);
        sqliteDb.markAttemptsSynced(syncedIds);
      }

      pendingAttemptsState = sqliteDb.getPendingAttempts();
      return { syncedCount: response.data?.syncedCount || 0 };
    } catch (e) {
      console.error('Offline sync failed:', e);
      return { syncedCount: 0 };
    } finally {
      isSyncingState = false;
      notify();
    }
  };

  return {
    isOnline: isOnlineState,
    isSyncing: isSyncingState,
    pendingAttempts: pendingAttemptsState,
    pendingCount: pendingAttemptsState.length,
    toggleNetwork,
    setNetworkStatus,
    refreshPending,
    syncOfflineAttempts,
  };
}
