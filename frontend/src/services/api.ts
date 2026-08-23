import ExpoConstants from 'expo-constants';
import { OfflineQueueManager } from './offline-queue';

// 📡 Force direct traffic routing onto your local machine development server
const getBaseUrl = (): string => {
  // Routes phone data requests straight to your computer's local IP address
  return 'http://192.168.100.6:8787'; 
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

      // 🌟 CRITICAL SAFETY FIX: Check the Content-Type header BEFORE parsing JSON strings!
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const rawText = await response.text();
        console.warn(`[API Client Warning] Server returned raw text instead of JSON payload: ${rawText}`);
        return { 
          success: false, 
          error: "Cloudflare routing error.", 
          data: [] // Returns an empty array to prevent your frontend lists from throwing crashes
        };
      }

      // Safely decode now that we are 100% sure it is a valid JSON format string
      return await response.json();
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
