import ExpoConstants from 'expo-constants';
import { OfflineQueueManager } from './offline-queue';

// 📡 Force direct traffic routing onto your local machine development server
const getBaseUrl = (): string => {
  // Routes data requests to the live Cloudflare production edge server
  return 'https://agri.vibezlabs.com'; 
};


const BASE_URL = getBaseUrl();



export const apiService = {
  /**
   * 🌾 Global Multi-Tenant Request Dispatcher
   */
  async request(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) {
    const endpoint = `${BASE_URL}${path}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      console.log(`[API Client] Syncing ${method} -> ${endpoint}`);
      
      // Pass the network thread directly through the 3s Abort Timeout Guard
      const response = await OfflineQueueManager.safeRequest(endpoint, options);
      
      // Automatically attempt an asynchronous background flush if an operation completes successfully
      if (method !== 'GET') {
        OfflineQueueManager.processQueue().catch(err => 
          console.log('[Sync Engine Background Intercept] Silent queue fail:', err)
        );
      }

      // 🌟 CRITICAL SAFETY FIX: Try parsing JSON directly.
      // If it fails, we catch it safely without relying on flaky Android headers.
      try {
        return await response.json();
      } catch (parseError) {
        const rawText = await response.text();
        console.warn(`[API Client Warning] Server returned raw text instead of JSON payload: ${rawText}`);
        return { 
          success: false, 
          error: "Cloudflare routing error.", 
          data: [] 
        };
      }
    } catch (error: any) {
      if (error.message === 'OFFLINE_MODE_ENGAGED') {
        return {
          success: false,
          offline: true,
          message: 'Low network signal detected. Actions saved to local hardware array storage.',
        };
      }
      
      console.error(`[API Client Error] Target crash at ${path}:`, error);
      return { success: false, error: error.message || 'Unknown network execution error', data: [] };
    }
  },

  // 🌿 Standalone CropCycle Manager Endpoints
  async getCropRows(farmId: number) {
    return this.request(`/api/crop/rows?farm_id=${farmId}`, 'GET');
  },

  async addCropRow(farmId: number, cropType: string, plantingDate: string) {
    return this.request('/api/crop/plant', 'POST', { 
      farm_id: farmId, 
      crop_type: cropType, 
      planting_date: plantingDate,
      harvest_status: 'planted',
      days_to_maturity: 75
    });
  }
};