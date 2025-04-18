import { create, StateCreator } from 'zustand';

// Define the shape of the authentication state
interface AuthState {
  isAuthenticated: boolean;
  permissions: string[] | null;
  isFullAccess: boolean;
  login: (permissions: string[], isFullAccess: boolean) => void;
  logout: () => void;
}

// Define the store creator with explicit types using StateCreator
const authStoreCreator: StateCreator<AuthState> = (set) => ({
  // Initial state
  isAuthenticated: false,
  permissions: null,
  isFullAccess: false,

  // Action to update state upon successful login
  login: (permissions: string[], isFullAccess: boolean) => set({
    isAuthenticated: true,
    permissions,
    isFullAccess,
  }),

  // Action to reset state upon logout
  logout: () => set({
    isAuthenticated: false,
    permissions: null,
    isFullAccess: false,
  }),
});

// Create the Zustand store using the typed creator
export const useAuthStore = create<AuthState>(authStoreCreator);

// Optionally, you can add middleware like persist later 
// if you want to sync with localStorage/sessionStorage automatically. 