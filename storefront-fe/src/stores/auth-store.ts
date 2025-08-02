import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'agent';
  preferences: UserPreferences;
  profile: UserProfile;
  verified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    showProfile: boolean;
    showBookingHistory: boolean;
  };
}

export interface UserProfile {
  dateOfBirth?: Date;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface AuthState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Authentication flow
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isResettingPassword: boolean;
  
  // Tokens and session
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  
  // Error handling
  authError: string | null;
  validationErrors: Record<string, string>;
  
  // Features
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  clearTokens: () => void;
  
  setAuthError: (error: string | null) => void;
  setValidationError: (field: string, error: string) => void;
  clearErrors: () => void;
  
  setLoading: (loading: boolean) => void;
  setLoggingIn: (loading: boolean) => void;
  setRegistering: (loading: boolean) => void;
  setResettingPassword: (loading: boolean) => void;
  
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  
  enableTwoFactor: () => Promise<boolean>;
  disableTwoFactor: (password: string) => Promise<boolean>;
  
  // Social authentication
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  
  // Utility
  isTokenExpired: () => boolean;
  hasPermission: (permission: string) => boolean;
}

const initialPreferences: UserPreferences = {
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  notifications: {
    email: true,
    sms: false,
    push: true,
    marketing: false,
  },
  privacy: {
    showProfile: false,
    showBookingHistory: false,
  },
};

const initialProfile: UserProfile = {};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        
        isLoading: false,
        isLoggingIn: false,
        isRegistering: false,
        isResettingPassword: false,
        
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        
        authError: null,
        validationErrors: {},
        
        twoFactorEnabled: false,
        biometricEnabled: false,
        
        // Actions
        login: async (credentials) => {
          set({ isLoggingIn: true, authError: null });
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });
            
            if (response.ok) {
              const data = await response.json();
              
              get().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
              get().setUser(data.user);
              
              set({ isAuthenticated: true, isLoggingIn: false });
              return true;
            } else {
              const error = await response.json();
              set({ authError: error.message, isLoggingIn: false });
              return false;
            }
          } catch (error) {
            set({ 
              authError: 'Login failed. Please try again.', 
              isLoggingIn: false 
            });
            return false;
          }
        },
        
        register: async (data) => {
          set({ isRegistering: true, authError: null, validationErrors: {} });
          
          // Client-side validation
          const errors: Record<string, string> = {};
          
          if (!data.firstName.trim()) errors.firstName = 'First name is required';
          if (!data.lastName.trim()) errors.lastName = 'Last name is required';
          if (!data.email.trim()) errors.email = 'Email is required';
          if (data.password.length < 8) errors.password = 'Password must be at least 8 characters';
          if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
          if (!data.agreeToTerms) errors.agreeToTerms = 'You must agree to the terms';
          
          if (Object.keys(errors).length > 0) {
            set({ validationErrors: errors, isRegistering: false });
            return false;
          }
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });
            
            if (response.ok) {
              const responseData = await response.json();
              
              // Auto-login after successful registration
              if (responseData.accessToken) {
                get().setTokens(responseData.accessToken, responseData.refreshToken, responseData.expiresIn);
                get().setUser(responseData.user);
                set({ isAuthenticated: true });
              }
              
              set({ isRegistering: false });
              return true;
            } else {
              const error = await response.json();
              set({ authError: error.message, isRegistering: false });
              return false;
            }
          } catch (error) {
            set({ 
              authError: 'Registration failed. Please try again.', 
              isRegistering: false 
            });
            return false;
          }
        },
        
        logout: () => {
          get().clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            authError: null,
            validationErrors: {},
          });
          
          // TODO: Call logout API endpoint to invalidate tokens
        },
        
        refreshSession: async () => {
          const refreshToken = get().refreshToken;
          
          if (!refreshToken) {
            get().logout();
            return false;
          }
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            
            if (response.ok) {
              const data = await response.json();
              get().setTokens(data.accessToken, data.refreshToken, data.expiresIn);
              return true;
            } else {
              get().logout();
              return false;
            }
          } catch (error) {
            get().logout();
            return false;
          }
        },
        
        updateProfile: (profile) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              profile: { ...currentUser.profile, ...profile },
            };
            set({ user: updatedUser });
          }
        },
        
        updatePreferences: (preferences) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              preferences: { ...currentUser.preferences, ...preferences },
            };
            set({ user: updatedUser });
          }
        },
        
        setUser: (user) => {
          set({ user });
        },
        
        setTokens: (accessToken, refreshToken, expiresIn) => {
          const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
          set({ 
            accessToken, 
            refreshToken, 
            tokenExpiry,
          });
        },
        
        clearTokens: () => {
          set({ 
            accessToken: null, 
            refreshToken: null, 
            tokenExpiry: null,
          });
        },
        
        setAuthError: (error) => {
          set({ authError: error });
        },
        
        setValidationError: (field, error) => {
          const currentErrors = get().validationErrors;
          set({
            validationErrors: { ...currentErrors, [field]: error },
          });
        },
        
        clearErrors: () => {
          set({ authError: null, validationErrors: {} });
        },
        
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        setLoggingIn: (loading) => {
          set({ isLoggingIn: loading });
        },
        
        setRegistering: (loading) => {
          set({ isRegistering: loading });
        },
        
        setResettingPassword: (loading) => {
          set({ isResettingPassword: loading });
        },
        
        requestPasswordReset: async (email) => {
          set({ isResettingPassword: true, authError: null });
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/request-reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            });
            
            set({ isResettingPassword: false });
            return response.ok;
          } catch (error) {
            set({ 
              authError: 'Password reset request failed.', 
              isResettingPassword: false 
            });
            return false;
          }
        },
        
        resetPassword: async (token, newPassword) => {
          set({ isResettingPassword: true, authError: null });
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/reset-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, newPassword }),
            });
            
            set({ isResettingPassword: false });
            return response.ok;
          } catch (error) {
            set({ 
              authError: 'Password reset failed.', 
              isResettingPassword: false 
            });
            return false;
          }
        },
        
        changePassword: async (currentPassword, newPassword) => {
          const accessToken = get().accessToken;
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/change-password', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ currentPassword, newPassword }),
            });
            
            return response.ok;
          } catch (error) {
            return false;
          }
        },
        
        verifyEmail: async (token) => {
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/verify-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token }),
            });
            
            if (response.ok) {
              const currentUser = get().user;
              if (currentUser) {
                set({ user: { ...currentUser, verified: true } });
              }
            }
            
            return response.ok;
          } catch (error) {
            return false;
          }
        },
        
        resendVerification: async () => {
          const user = get().user;
          
          if (!user) return false;
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/resend-verification', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email }),
            });
            
            return response.ok;
          } catch (error) {
            return false;
          }
        },
        
        enableTwoFactor: async () => {
          const accessToken = get().accessToken;
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/enable-2fa', {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${accessToken}`,
              },
            });
            
            if (response.ok) {
              set({ twoFactorEnabled: true });
            }
            
            return response.ok;
          } catch (error) {
            return false;
          }
        },
        
        disableTwoFactor: async (password) => {
          const accessToken = get().accessToken;
          
          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/disable-2fa', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ password }),
            });
            
            if (response.ok) {
              set({ twoFactorEnabled: false });
            }
            
            return response.ok;
          } catch (error) {
            return false;
          }
        },
        
        loginWithGoogle: async () => {
          // TODO: Implement Google OAuth
          return false;
        },
        
        loginWithFacebook: async () => {
          // TODO: Implement Facebook OAuth
          return false;
        },
        
        isTokenExpired: () => {
          const tokenExpiry = get().tokenExpiry;
          if (!tokenExpiry) return true;
          return new Date() >= tokenExpiry;
        },
        
        hasPermission: (permission) => {
          const user = get().user;
          if (!user) return false;
          
          // TODO: Implement role-based permissions
          const rolePermissions: Record<string, string[]> = {
            customer: ['view_bookings', 'create_booking', 'cancel_booking'],
            agent: ['view_bookings', 'create_booking', 'cancel_booking', 'manage_customers'],
            admin: ['*'], // All permissions
          };
          
          const userPermissions = rolePermissions[user.role] || [];
          return userPermissions.includes('*') || userPermissions.includes(permission);
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          tokenExpiry: state.tokenExpiry,
          twoFactorEnabled: state.twoFactorEnabled,
          biometricEnabled: state.biometricEnabled,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  login: state.login,
  logout: state.logout,
  register: state.register,
}));

export const useAuthStatus = () => useAuthStore((state) => ({
  isLoggingIn: state.isLoggingIn,
  isRegistering: state.isRegistering,
  isResettingPassword: state.isResettingPassword,
  authError: state.authError,
  validationErrors: state.validationErrors,
}));

export const usePermissions = () => useAuthStore((state) => ({
  hasPermission: state.hasPermission,
  user: state.user,
}));
