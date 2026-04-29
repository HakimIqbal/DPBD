// API Service for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Token is written by auth-context under the `dpbd_token` key — keep
    // this in sync with `frontend/lib/auth-context.tsx`. Reading the wrong
    // key silently produces unauthenticated requests, which surface as
    // empty data rather than visible errors.
    return localStorage.getItem('dpbd_token');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GET ${endpoint}:`, error);
      return null;
    }
  }

  async post<T>(endpoint: string, data: any, includeAuth = true): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`POST ${endpoint}:`, error);
      return null;
    }
  }

  async patch<T>(endpoint: string, data: any, includeAuth = true): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`PATCH ${endpoint}:`, error);
      return null;
    }
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`DELETE ${endpoint}:`, error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data, false),
  login: (data: any) => apiClient.post('/auth/login', data, false),
  getProfile: () => apiClient.get('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: () => apiClient.get('/users'),
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: any) => apiClient.patch('/users/profile', data),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  getStats: (id: string) => apiClient.get(`/users/${id}/stats`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/users/${id}/status/${status}`, {}),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Programs API
export const programsApi = {
  getAll: () => apiClient.get('/programs'),
  getById: (id: string) => apiClient.get(`/programs/${id}`),
  getStats: (id: string) => apiClient.get(`/programs/${id}/stats`),
  create: (data: any) => apiClient.post('/programs', data),
  update: (id: string, data: any) => apiClient.patch(`/programs/${id}`, data),
  publish: (id: string) => apiClient.patch(`/programs/${id}/publish`, {}),
  complete: (id: string) => apiClient.patch(`/programs/${id}/complete`, {}),
  delete: (id: string) => apiClient.delete(`/programs/${id}`),
};

// Donations API
export const donationsApi = {
  getAll: () => apiClient.get('/donations'),
  getById: (id: string) => apiClient.get(`/donations/${id}`),
  create: (data: any) => apiClient.post('/donations', data),
  getStats: (programId: string) => apiClient.get(`/donations/program/${programId}/stats`),
};

// Disbursements API
export const disbursementsApi = {
  getAll: () => apiClient.get('/disbursements'),
  getById: (id: string) => apiClient.get(`/disbursements/${id}`),
  create: (data: any) => apiClient.post('/disbursements', data),
  update: (id: string, data: any) => apiClient.patch(`/disbursements/${id}`, data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/disbursements/${id}/status/${status}`, {}),
  delete: (id: string) => apiClient.delete(`/disbursements/${id}`),
};

// News API
export const newsApi = {
  getAll: () => apiClient.get('/news'),
  getById: (id: string) => apiClient.get(`/news/${id}`),
  create: (data: any) => apiClient.post('/news', data),
  update: (id: string, data: any) => apiClient.patch(`/news/${id}`, data),
  publish: (id: string) => apiClient.patch(`/news/${id}/publish`, {}),
  unpublish: (id: string) => apiClient.patch(`/news/${id}/unpublish`, {}),
  delete: (id: string) => apiClient.delete(`/news/${id}`),
};

// Partners API
export const partnersApi = {
  getAll: () => apiClient.get('/partners'),
  getById: (id: string) => apiClient.get(`/partners/${id}`),
  create: (data: any) => apiClient.post('/partners', data),
  update: (id: string, data: any) => apiClient.patch(`/partners/${id}`, data),
  toggle: (id: string) => apiClient.patch(`/partners/${id}/toggle`, {}),
  delete: (id: string) => apiClient.delete(`/partners/${id}`),
};

// FAQs API
export const faqsApi = {
  getAll: () => apiClient.get('/faqs'),
  getById: (id: string) => apiClient.get(`/faqs/${id}`),
  getByCategory: (category: string) => apiClient.get(`/faqs/category/${category}`),
  create: (data: any) => apiClient.post('/faqs', data),
  update: (id: string, data: any) => apiClient.patch(`/faqs/${id}`, data),
  toggle: (id: string) => apiClient.patch(`/faqs/${id}/toggle`, {}),
  delete: (id: string) => apiClient.delete(`/faqs/${id}`),
};

// Payments API
export const paymentsApi = {
  createPayment: (data: any) => apiClient.post('/payments/create', data, true),
  getStatus: (orderId: string) => apiClient.get(`/payments/status/${orderId}`, true),
  getDonation: (donationId: string) => apiClient.get(`/payments/donation/${donationId}`, true),
  handleWebhook: (data: any) => apiClient.post('/payments/webhook/midtrans', data, false),
};
