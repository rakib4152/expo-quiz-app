// Centralized API Client for Expo Mobile App
// Auto-attaches auth tokens, handles 401 token refresh and formatted errors.

import { AuthStorage } from '../storage.ts';
import type { ApiResponse } from '../../../types/quiz.ts';

const getBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/v1`;
  }
  return 'https://ais-dev-4bjzqvwall6zdaojnl3ork-365858207471.asia-east1.run.app/api/v1';
};

const BASE_URL = getBaseUrl();

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  retryOn401?: boolean;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = await AuthStorage.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const resData: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> = await response.json();
      if (resData.success && resData.data?.tokens) {
        await AuthStorage.setAccessToken(resData.data.tokens.accessToken);
        await AuthStorage.setRefreshToken(resData.data.tokens.refreshToken);
        return resData.data.tokens.accessToken;
      }
      await AuthStorage.clearTokens();
      return null;
    } catch {
      await AuthStorage.clearTokens();
      return null;
    }
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { requiresAuth = true, retryOn401 = true, headers: customHeaders, ...fetchOptions } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (requiresAuth) {
      const token = await AuthStorage.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && requiresAuth && retryOn401) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const newToken = await this.refreshAccessToken();
          this.isRefreshing = false;

          if (newToken) {
            this.onTokenRefreshed(newToken);
            return this.request<T>(endpoint, { ...options, retryOn401: false });
          }
        } else {
          return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.addRefreshSubscriber(async () => {
              try {
                const res = await this.request<T>(endpoint, { ...options, retryOn401: false });
                resolve(res);
              } catch (err) {
                reject(err);
              }
            });
          });
        }
      }

      const text = await response.text();
      let data: ApiResponse<T>;
      try {
        data = text ? JSON.parse(text) : { success: response.ok } as ApiResponse<T>;
      } catch {
        throw new ApiError(
          response.ok ? 'Invalid response format from server.' : `Server returned error (${response.status})`,
          'PARSE_ERROR',
          response.status
        );
      }

      if (!response.ok || !data.success) {
        const errorInfo = data.error || { code: 'HTTP_ERROR', message: response.statusText || 'An unexpected error occurred' };
        throw new ApiError(errorInfo.message, errorInfo.code, response.status, errorInfo.details);
      }

      return data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error?.message || 'Network request failed. Check your connection.', 'NETWORK_ERROR', 0);
    }
  }

  async get<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(BASE_URL);
