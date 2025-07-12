import axios from 'axios';
import ENV from '@/utils/env';

// Use consistent token key across the app
const TOKEN_KEY = 'auth_token'; // Match what AuthContext uses

// Configure axios defaults
axios.defaults.baseURL = ENV.API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Attach JWT token to every request if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY); // Use consistent key
    if (token) {
      if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('[API] Attaching token to request');
      }
    } else {
      console.log('[API] No token found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling and token management
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('[API] Request failed:', error.response?.data || error.message);
    
    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401) {
      console.log('[API] Received 401, token may be expired');
      // Don't automatically clear token here - let AuthContext handle it
      // This prevents clearing valid tokens on network issues
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      try {
        console.log('[API] Attempting login for:', email);
        const response = await axios.post('/auth/login', { email, password });
        
        // The backend returns 'token' field
        const token = response.data?.token;
        
        if (token) {
          localStorage.setItem(TOKEN_KEY, token); // Use consistent key
          console.log('[API] Token saved to localStorage successfully');
        } else {
          console.error('[API] No token found in login response:', response.data);
          throw new Error('No token received from server');
        }
        
        return response;
      } catch (error) {
        console.error('[API] Login error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    register: async (username: string, email: string, password: string) => {
      try {
        const response = await axios.post('/auth/register', { username, email, password });
        
        // Registration also returns a token
        const token = response.data?.token;
        if (token) {
          localStorage.setItem(TOKEN_KEY, token); // Use consistent key
          console.log('[API] Token saved after registration');
        }
        
        return response;
      } catch (error) {
        console.error('[API] Registration error:', error.response?.data || error.message);
        throw error;
      }
    },
    
    logout: () => {
      localStorage.removeItem(TOKEN_KEY); // Use consistent key
      console.log('[API] Token removed from localStorage');
      return axios.post('/auth/logout');
    },
    
    me: () => axios.get('/auth/me'),
  },

  // Questions endpoints
  questions: {
    getAll: (params?: { page?: number; limit?: number; search?: string; filter?: string }) =>
      axios.get('/questions', { params }),
    getById: (id: string) => {
      console.log('API: Fetching question by ID:', id);
      return axios.get(`/questions/${id}`)
        .then(response => {
          console.log('API: Question fetch successful:', response.data);
          return response;
        })
        .catch(error => {
          console.error('API: Error fetching question:', error);
          throw error;
        });
    },
    create: (data: { title: string; description: string; tags: string[] }) =>
      axios.post('/questions', data),
    update: (id: string, data: { title?: string; content?: string; tags?: string[] }) =>
      axios.put(`/questions/${id}`, data),
    delete: (id: string) => axios.delete(`/questions/${id}`),
    search: (query: string) => axios.get(`/questions/search?q=${query}`),
  },

  // Answers endpoints
  answers: {
    create: (questionId: string, content: string) =>
      axios.post(`/answers/${questionId}`, { content }),
    update: (id: string, content: string) =>
      axios.put(`/answers/${id}`, { content }),
    delete: (id: string) => axios.delete(`/answers/${id}`),
    vote: (id: string, voteType: 'up' | 'down') =>
      axios.post(`/answers/vote/${id}`, { voteType }),
    accept: (id: string) => axios.patch(`/answers/${id}/accept`),
  },

  // User endpoints
  users: {
    getProfile: (username: string) => axios.get(`/users/${username}`),
    updateProfile: (data: { bio?: string; location?: string; website?: string }) =>
      axios.put('/users/profile', data),
    getQuestions: (username: string) => axios.get(`/users/${username}/questions`),
    getAnswers: (username: string) => axios.get(`/users/${username}/answers`),
  },

  // Admin endpoints
  admin: {
    getStats: () => axios.get('/admin/stats'),
    getUsers: () => axios.get('/admin/users'),
    banUser: (userId: string, banned: boolean) => axios.patch(`/admin/users/${userId}/ban`, { banned }),
    getQuestions: () => axios.get('/admin/questions'),
    moderateQuestion: (questionId: string, status: 'approved' | 'rejected') => 
      axios.patch(`/admin/questions/${questionId}/moderate`, { status }),
    deleteQuestion: (questionId: string) => axios.delete(`/admin/questions/${questionId}`),
    deleteAnswer: (answerId: string) => axios.delete(`/admin/answers/${answerId}`),
    sendPlatformMessage: (title: string, message: string) => 
      axios.post('/admin/messages', { title, message }),
    getUserActivityReport: () => axios.get('/admin/reports/user-activity'),
  },

  // Notifications endpoints
  notifications: {
    getAll: () => axios.get('/notifications'),
    getCount: () => axios.get('/notifications/count'),
    markAsRead: (id: string) => axios.patch(`/notifications/mark-read/${id}`),
    markAllAsRead: () => axios.patch('/notifications/mark-all-read'),
  },

  // Admin endpoints
  admin: {
    getUsers: () => axios.get('/admin/users'),
    banUser: (id: string) => axios.patch(`/admin/users/${id}/ban`),
    unbanUser: (id: string) => axios.patch(`/admin/users/${id}/unban`),
    deleteQuestion: (id: string) => axios.delete(`/admin/questions/${id}`),
    deleteAnswer: (id: string) => axios.delete(`/admin/answers/${id}`),
    getStats: () => axios.get('/admin/stats'),
  },
};

export default api;