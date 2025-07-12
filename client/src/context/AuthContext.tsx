import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '@/services/api'; // Use your API client instead of axios directly
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem('auth_token'); // Use consistent key with API service
    if (token) {
      console.log('[Auth] Token found in localStorage, checking authentication...');
      checkAuth();
    } else {
      console.log('[Auth] No token found, user not authenticated');
    }
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('[Auth] Checking authentication...');
      const response = await api.auth.me();
      console.log('[Auth] Authentication successful:', response.data);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data });
    } catch (error: any) {
      console.error('[Auth] Authentication check failed:', error.response?.data || error.message);
      // Token is invalid, clean up
      localStorage.removeItem('auth_token'); // Use consistent key with API service
      dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('[Auth] Attempting login for:', email);
      
      // Use your API client which handles token saving
      const response = await api.auth.login(email, password);
      const user = response.data.user;
      
      console.log('[Auth] Login successful:', user);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.username}`,
      });
    } catch (error: any) {
      console.error('[Auth] Login failed:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
      });
      throw error; // Re-throw so calling component can handle it
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('[Auth] Attempting registration for:', username);
      
      // Use your API client which handles token saving
      const response = await api.auth.register(username, email, password);
      const user = response.data.user;
      
      console.log('[Auth] Registration successful:', user);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      
      toast({
        title: 'Welcome to StackIt!',
        description: `Account created for ${user.username}`,
      });
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive',
      });
      throw error; // Re-throw so calling component can handle it
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out user');
    localStorage.removeItem('auth_token'); // Use consistent key with API service
    dispatch({ type: 'LOGOUT' });
    toast({
      title: 'Goodbye!',
      description: 'You have been logged out.',
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};