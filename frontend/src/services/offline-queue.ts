import AsyncStorage from '@react-native-async-storage/async-storage';

// frontend/src/services/offline-queue.ts

const TIMEOUT_LIMIT_MS = 3000;
const STORAGE_KEY_QUEUE = '@CropCycle:offline_sync_queue';


export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: number;
}

export class OfflineQueueManager {
  private static isSyncing = false;

  /**
   * ⚡ Fetch client wrapper with embedded 3-second network timeout guard
   */
  static async safeRequest(endpoint: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_LIMIT_MS);

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);

      // Check if thread was explicitly broken by timeout guard or lost connection
      if (error.name === 'AbortError' || error.message?.includes('Network request failed')) {
        console.warn(`[Network Guard] Target timeout reached or connection drops at: ${endpoint}`);
        
        // Cache data payload sequentially into storage arrays if it's a mutating request
        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
          await this.enqueue(endpoint, options.method, options.body ? JSON.parse(options.body as string) : null);
        }
        throw new Error('OFFLINE_MODE_ENGAGED');
      }
      throw error;
    }
  }

  /**
   * 📦 Locks failed payloads into secure internal device hardware storage arrays
   */
  private static async enqueue(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload: any) {
    try {
      const existingQueueData = await AsyncStorage.getItem(STORAGE_KEY_QUEUE);
      const queue: QueuedRequest[] = existingQueueData ? JSON.parse(existingQueueData) : [];

      const newRequest: QueuedRequest = {
        id: Math.random().toString(36).substring(7),
        endpoint,
        method,
        payload,
        timestamp: Date.now(),
      };

      queue.push(newRequest);
      await AsyncStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
      console.log(`[Queue Matrix] Payload locked successfully. Queue size: ${queue.length}`);
    } catch (err) {
      console.error('[Queue Matrix] Failed writing backup stream down to hardware:', err);
    }
  }

  /**
   * 🔄 Flushes persistent local storage items up onto remote production clouds sequentially
   */
  static async processQueue(authToken?: string): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const existingQueueData = await AsyncStorage.getItem(STORAGE_KEY_QUEUE);
      if (!existingQueueData) {
        this.isSyncing = false;
        return;
      }

      let queue: QueuedRequest[] = JSON.parse(existingQueueData);
      if (queue.length === 0) {
        this.isSyncing = false;
        return;
      }

      console.log(`[Sync Engine] Attempting connectivity check for ${queue.length} items...`);

      // Process elements oldest-to-newest to protect record timelines
      while (queue.length > 0) {
        const item = queue[0];

        try {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), TIMEOUT_LIMIT_MS);

          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            },
            body: item.payload ? JSON.stringify(item.payload) : undefined,
            signal: controller.signal,
          });

          clearTimeout(id);

          if (response.ok || response.status === 400) {
            // Delete element upon a successful upload or standard validation structural error
            queue.shift();
            await AsyncStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
          } else {
            // Server error or gate blocks (e.g. 500, 403), pause syncing queue chain
            break;
          }
        } catch (connectionError) {
          console.log('[Sync Engine] Link handshake failed, preserving stack state.');
          break; // Keep items locked, escape sync thread until carrier frequencies signal recovery
        }
      }
    } catch (err) {
      console.error('[Sync Engine] Uncaught loop processing breakdown:', err);
    } finally {
      this.isSyncing = false;
    }
  }
}
