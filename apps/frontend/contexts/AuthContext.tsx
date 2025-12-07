'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { authClient, useSession } from '../lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'client';
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: 'therapist' | 'client'
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending: isLoading } = useSession();

  const user = session?.user as User | null;
  const isAuthenticated = !!user;

  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        return { error: result.error.message || 'Login failed' };
      }

      return {};
    },
    []
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: 'therapist' | 'client'
    ): Promise<{ error?: string }> => {
      // Truncate name if > 32 characters
      const truncatedName = name.length > 32 ? name.substring(0, 29) + '...' : name;

      const result = await authClient.signUp.email({
        email,
        password,
        name: truncatedName,
        role,
      });

      if (result.error) {
        return { error: result.error.message || 'Signup failed' };
      }

      return {};
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await authClient.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
