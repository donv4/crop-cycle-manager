// src/hooks/useFarmSync.ts
import { useState } from 'react';
import { apiService } from '../services/api';
import { OfflineQueueManager } from '../services/offline-queue';

export function useFarmSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * 🌾 Global Activity Logger
   * Automatically passes data streams through the 3s Timeout Guard & Offline Cache Matrix
   */
  const logFarmActivity = async (endpoint: string, payload: any) => {
    try {
      // ⚡ Pass request through the updated unified API service dispatcher
      const response = await apiService.request(endpoint, 'POST', payload);
      return response;
    } catch (error) {
      console.error('[Farm Sync Hook Error]:', error);
      return { success: false, offline: true };
    }
  };

  /**
   * 🔄 Background Queue Sync Trigger
   * Manually flush queued local hardware payloads up onto remote production clouds
   */
  const triggerBackgroundSync = async (authToken?: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    
    try {
      await OfflineQueueManager.processQueue(authToken);
    } catch (error) {
      console.error('[Background Sync Intercept Error]:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { 
    logFarmActivity, 
    triggerBackgroundSync,
    isSyncing 
  };
}
