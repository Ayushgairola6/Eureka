import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  Login: () => void;
  
}

export const useStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  Login: () => set({ isLoggedIn: true }),
  // Logout: () => set({ isLoggedIn: false })
}));