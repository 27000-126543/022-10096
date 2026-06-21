import { create } from 'zustand';
import { User, UserRole } from '../../shared/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarCollapsed: boolean;
  currentPage: string;

  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  login: (user: User) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentPage: (page: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  sidebarCollapsed: false,
  currentPage: 'dashboard',

  setUser: (user) => set({ user }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : state.user,
    })),
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false, currentPage: 'dashboard' }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
