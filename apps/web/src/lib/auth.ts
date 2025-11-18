import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isEmailVerified: boolean;
  profile?: {
    fullName?: string;
    bio?: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Client-side auth functions
export class AuthClient {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  static async register(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
  }): Promise<{ message: string; userId: string }> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  static async logout(refreshToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Clear tokens from storage
    this.clearTokens();
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }

    return response.json();
  }

  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  }

  static async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Email verification failed');
    }

    return response.json();
  }

  static async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  // Token management (localStorage)
  static setTokens(accessToken: string, refreshToken: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Also set cookies for middleware
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}`; // 15 minutes
      document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear cookies
      document.cookie = 'accessToken=; path=/; max-age=0';
      document.cookie = 'userRole=; path=/; max-age=0';
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Server-side auth functions (for app router)
export async function getServerSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}
