import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, Task, CreateTaskPayload, UpdateTaskPayload, TaskListResponse, APIError, Subtask, CreateSubtaskPayload, UpdateSubtaskPayload, ForgotPasswordResponse, TokenValidationResponse, ResetPasswordResponse } from './types';

// Network status tracking
let isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Setup online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    console.log('Network connection restored');
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    console.log('Network connection lost');
  });
}

// Request interceptor to attach JWT token and check network status
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if offline before making request
    if (!isOnline) {
      return Promise.reject({
        message: 'No internet connection. Please check your network and try again.',
        isNetworkError: true,
      });
    }

    // Get token from localStorage (Better Auth will manage this)
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<APIError>) => {
    // Handle network errors
    if (!error.response) {
      // Network error (no response from server)
      return Promise.reject({
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        isNetworkError: true,
        status: 0,
      });
    }

    // Handle 401 Unauthorized - redirect to sign-in
    if (error.response?.status === 401) {
      // Clear token
      localStorage.removeItem('auth_token');

      // Redirect to sign-in page (only in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
    }

    // Transform error to user-friendly message
    let errorMessage = 'An unexpected error occurred';

    // Safely extract error message, ensuring it's always a string
    const responseData = error.response?.data as any;
    if (responseData?.detail) {
      errorMessage = typeof responseData.detail === 'string'
        ? responseData.detail
        : JSON.stringify(responseData.detail);
    } else if (responseData?.error) {
      errorMessage = typeof responseData.error === 'string'
        ? responseData.error
        : JSON.stringify(responseData.error);
    } else if (error.message) {
      errorMessage = error.message;
    }

    const errorDetails = responseData?.details;

    return Promise.reject({
      message: errorMessage,
      details: errorDetails,
      status: error.response?.status,
      isNetworkError: false,
    });
  }
);

// API methods
export const api = {
  // Authentication
  auth: {
    signUp: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/auth/signup', {
        email,
        password,
      });
      return response.data;
    },

    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/auth/signin', {
        email,
        password,
      });
      return response.data;
    },

    forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
      const response = await apiClient.post<ForgotPasswordResponse>('/api/auth/forgot-password', {
        email,
      });
      return response.data;
    },

    verifyResetToken: async (token: string): Promise<TokenValidationResponse> => {
      const response = await apiClient.get<TokenValidationResponse>(`/api/auth/reset-password/${token}`);
      return response.data;
    },

    resetPassword: async (token: string, new_password: string): Promise<ResetPasswordResponse> => {
      const response = await apiClient.post<ResetPasswordResponse>('/api/auth/reset-password', {
        token,
        new_password,
      });
      return response.data;
    },
  },

  // Tasks
  tasks: {
    list: async (signal?: AbortSignal): Promise<Task[]> => {
      const response = await apiClient.get<TaskListResponse>('/api/tasks', { signal });
      return response.data.tasks;
    },

    get: async (id: number, signal?: AbortSignal): Promise<Task> => {
      const response = await apiClient.get<Task>(`/api/tasks/${id}`, { signal });
      return response.data;
    },

    create: async (payload: CreateTaskPayload, signal?: AbortSignal): Promise<Task> => {
      const response = await apiClient.post<Task>('/api/tasks', payload, { signal });
      return response.data;
    },

    update: async (id: number, payload: UpdateTaskPayload, signal?: AbortSignal): Promise<Task> => {
      const response = await apiClient.put<Task>(`/api/tasks/${id}`, payload, { signal });
      return response.data;
    },

    delete: async (id: number, signal?: AbortSignal): Promise<void> => {
      await apiClient.delete(`/api/tasks/${id}`, { signal });
    },
  },

  // Subtasks
  subtasks: {
    list: async (taskId: number, signal?: AbortSignal): Promise<Subtask[]> => {
      const response = await apiClient.get<{ subtasks: Subtask[] }>(`/api/tasks/${taskId}/subtasks`, { signal });
      return response.data.subtasks;
    },

    create: async (taskId: number, payload: CreateSubtaskPayload, signal?: AbortSignal): Promise<Subtask> => {
      const response = await apiClient.post<Subtask>(`/api/tasks/${taskId}/subtasks`, payload, { signal });
      return response.data;
    },

    update: async (subtaskId: number, payload: UpdateSubtaskPayload, signal?: AbortSignal): Promise<Subtask> => {
      const response = await apiClient.put<Subtask>(`/api/subtasks/${subtaskId}`, payload, { signal });
      return response.data;
    },

    delete: async (subtaskId: number, signal?: AbortSignal): Promise<void> => {
      await apiClient.delete(`/api/subtasks/${subtaskId}`, { signal });
    },
  },

  // AI Features
  ai: {
    generateSuggestions: async (context: string, count: number = 5, signal?: AbortSignal): Promise<string[]> => {
      const response = await apiClient.post<{ suggestions: string[] }>('/api/ai/suggestions', {
        context,
        count,
      }, { signal });
      return response.data.suggestions;
    },

    enhanceDescription: async (title: string, description: string = '', signal?: AbortSignal): Promise<string> => {
      const response = await apiClient.post<{ enhanced_description: string }>('/api/ai/enhance-description', {
        title,
        description,
      }, { signal });
      return response.data.enhanced_description;
    },

    categorizeTask: async (title: string, description: string = '', signal?: AbortSignal): Promise<{
      category: string;
      priority: string;
      tags: string[];
    }> => {
      const response = await apiClient.post<{
        category: string;
        priority: string;
        tags: string[];
      }>('/api/ai/categorize', {
        title,
        description,
      }, { signal });
      return response.data;
    },

    autocomplete: async (partialTitle: string, signal?: AbortSignal): Promise<string[]> => {
      const response = await apiClient.post<{ completions: string[] }>('/api/ai/autocomplete', {
        partial_title: partialTitle,
      }, { signal });
      return response.data.completions;
    },

    analyzeComplexity: async (title: string, description: string = '', signal?: AbortSignal): Promise<{
      complexity: string;
      estimated_time: string;
      needs_subtasks: boolean;
    }> => {
      const response = await apiClient.post<{
        complexity: string;
        estimated_time: string;
        needs_subtasks: boolean;
      }>('/api/ai/analyze-complexity', {
        title,
        description,
      }, { signal });
      return response.data;
    },

    healthCheck: async (signal?: AbortSignal): Promise<{
      status: string;
      message: string;
      provider?: string;
    }> => {
      const response = await apiClient.get<{
        status: string;
        message: string;
        provider?: string;
      }>('/api/ai/health', { signal });
      return response.data;
    },
  },
};

export default apiClient;
