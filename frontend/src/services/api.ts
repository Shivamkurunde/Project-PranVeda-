import { auth } from '../integrations/firebase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}

// Auth API
export const authAPI = {
  getMe: () => apiRequest('/api/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/api/users/profile'),
  updateProfile: (data: any) => 
    apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Health check
export const healthAPI = {
  check: () => apiRequest('/api/health/health'),
  checkDB: () => apiRequest('/api/health/health/db'),
};

// Default API client (axios-like interface)
export const api = {
  get: async <T = any>(endpoint: string, config?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...config, method: 'GET' });
  },
  
  post: async <T = any>(endpoint: string, data?: any, config?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: async <T = any>(endpoint: string, data?: any, config?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete: async <T = any>(endpoint: string, config?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { ...config, method: 'DELETE' });
  },
  
  patch: async <T = any>(endpoint: string, data?: any, config?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
};

// Default export
export default api;
