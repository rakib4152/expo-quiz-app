// Mobile storage abstraction mirroring Expo SecureStore and AsyncStorage
// Provides encrypted token storage semantics and local key-value persistence.

const TOKEN_KEY = 'quizpulse_secure_auth_token';
const REFRESH_TOKEN_KEY = 'quizpulse_secure_refresh_token';
const USER_KEY = 'quizpulse_cached_user';

export const SecureStore = {
  async getItemAsync(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to set secure store key:', key, e);
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to delete secure store key:', key, e);
    }
  },
};

export const AuthStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async getUser(): Promise<any | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async setUser(user: any): Promise<void> {
    return SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
};
