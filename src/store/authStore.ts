import { create, StateCreator } from 'zustand';

// Define the shape of the authentication state
interface AuthState {
  isAuthenticated: boolean;
  permissions: string[] | null;
  isFullAccess: boolean;
  username: string | null;
  login: (username: string, permissions: string[], isFullAccess: boolean) => void;
  logout: () => void;
}

// Define the store creator with explicit types using StateCreator
const authStoreCreator: StateCreator<AuthState> = (set) => ({
  // Initial state
  isAuthenticated: false,
  permissions: null,
  isFullAccess: false,
  username: null,

  // Action to update state upon successful login
  login: (username: string, permissions: string[], isFullAccess: boolean) => set({
    isAuthenticated: true,
    permissions,
    isFullAccess,
    username,
  }),

  // Action to reset state upon logout
  logout: () => set({
    isAuthenticated: false,
    permissions: null,
    isFullAccess: false,
    username: null,
  }),
});

// Create the Zustand store using the typed creator
export const useAuthStore = create<AuthState>(authStoreCreator);

// Optionally, you can add middleware like persist later 
// if you want to sync with localStorage/sessionStorage automatically. 