import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      credentials,
      { skipAuth: true }
    );

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));

    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const data = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      userData,
      { skipAuth: true }
    );

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: data.role }));

    return data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await apiClient.post('/api/auth/logout', { token });
      }
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

export default authService;