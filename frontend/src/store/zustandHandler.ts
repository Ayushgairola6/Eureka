import { create } from 'zustand';


interface AuthState {
  isLoggedIn: boolean;
  Login: () => void;
  currTab: string;
  setCurrTab: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}



export const useStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  Login: () => set({ isLoggedIn: true }),
  currTab: 'Home',
  setCurrTab: () => set({ currTab: 'yeah' }),
  isDarkMode: false, 
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));