import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  Login: () => void;
  currTab: string;
  setCurrTab: () => void;
}

export const useStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  Login: () => set({ isLoggedIn: true }),
  currTab: 'Home',
  setCurrTab: () => set({ currTab: 'yeah' })
}));