import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'outline';
}

export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
}

export interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Notifications
  notifications: Notification[];
  
  // Modals and overlays
  modals: Modal[];
  activeModal: string | null;
  
  // Navigation
  mobileMenuOpen: boolean;
  searchModalOpen: boolean;
  
  // Page state
  pageTitle: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Responsive
  isMobile: boolean;
  isTablet: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  
  setMobileMenuOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  
  setPageTitle: (title: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  
  setScreenSize: (isMobile: boolean, isTablet: boolean) => void;
}

let notificationCounter = 0;
let modalCounter = 0;

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        sidebarCollapsed: false,
        
        globalLoading: false,
        loadingMessage: '',
        
        notifications: [],
        
        modals: [],
        activeModal: null,
        
        mobileMenuOpen: false,
        searchModalOpen: false,
        
        pageTitle: '',
        breadcrumbs: [],
        
        isMobile: false,
        isTablet: false,
        
        // Actions
        setTheme: (theme) => {
          set({ theme });
          
          // Apply theme to document
          if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            
            if (theme === 'dark') {
              root.classList.add('dark');
            } else if (theme === 'light') {
              root.classList.remove('dark');
            } else {
              // System theme
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              if (mediaQuery.matches) {
                root.classList.add('dark');
              } else {
                root.classList.remove('dark');
              }
            }
          }
        },
        
        toggleSidebar: () => {
          const currentState = get().sidebarCollapsed;
          set({ sidebarCollapsed: !currentState });
        },
        
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },
        
        setGlobalLoading: (loading, message = '') => {
          set({ globalLoading: loading, loadingMessage: message });
        },
        
        addNotification: (notification) => {
          const id = `notification-${++notificationCounter}`;
          const newNotification: Notification = {
            id,
            duration: 5000, // Default 5 seconds
            persistent: false,
            ...notification,
          };
          
          const currentNotifications = get().notifications;
          set({ notifications: [...currentNotifications, newNotification] });
          
          // Auto-remove non-persistent notifications
          if (!newNotification.persistent && newNotification.duration) {
            setTimeout(() => {
              get().removeNotification(id);
            }, newNotification.duration);
          }
        },
        
        removeNotification: (id) => {
          const currentNotifications = get().notifications;
          set({
            notifications: currentNotifications.filter(n => n.id !== id),
          });
        },
        
        clearNotifications: () => {
          set({ notifications: [] });
        },
        
        openModal: (modal) => {
          const id = `modal-${++modalCounter}`;
          const newModal: Modal = {
            id,
            size: 'md',
            closable: true,
            ...modal,
          };
          
          const currentModals = get().modals;
          set({
            modals: [...currentModals, newModal],
            activeModal: id,
          });
        },
        
        closeModal: (id) => {
          const currentModals = get().modals;
          const activeModal = get().activeModal;
          
          if (id) {
            // Close specific modal
            const updatedModals = currentModals.filter(m => m.id !== id);
            const newActiveModal = activeModal === id 
              ? (updatedModals.length > 0 ? updatedModals[updatedModals.length - 1].id : null)
              : activeModal;
            
            set({
              modals: updatedModals,
              activeModal: newActiveModal,
            });
          } else {
            // Close active modal
            if (activeModal) {
              get().closeModal(activeModal);
            }
          }
        },
        
        closeAllModals: () => {
          set({
            modals: [],
            activeModal: null,
          });
        },
        
        setMobileMenuOpen: (open) => {
          set({ mobileMenuOpen: open });
        },
        
        setSearchModalOpen: (open) => {
          set({ searchModalOpen: open });
        },
        
        setPageTitle: (title) => {
          set({ pageTitle: title });
          
          // Update document title
          if (typeof window !== 'undefined') {
            document.title = title ? `${title} - BookingSmart` : 'BookingSmart';
          }
        },
        
        setBreadcrumbs: (breadcrumbs) => {
          set({ breadcrumbs });
        },
        
        setScreenSize: (isMobile, isTablet) => {
          set({ isMobile, isTablet });
          
          // Auto-close mobile menu when screen size changes
          if (!isMobile && get().mobileMenuOpen) {
            set({ mobileMenuOpen: false });
          }
        },
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// Selectors for optimized re-renders
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebar = () => useUIStore((state) => ({
  collapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setCollapsed: state.setSidebarCollapsed,
}));

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  add: state.addNotification,
  remove: state.removeNotification,
  clear: state.clearNotifications,
}));

export const useModals = () => useUIStore((state) => ({
  modals: state.modals,
  activeModal: state.activeModal,
  open: state.openModal,
  close: state.closeModal,
  closeAll: state.closeAllModals,
}));

export const useNavigation = () => useUIStore((state) => ({
  mobileMenuOpen: state.mobileMenuOpen,
  searchModalOpen: state.searchModalOpen,
  setMobileMenuOpen: state.setMobileMenuOpen,
  setSearchModalOpen: state.setSearchModalOpen,
}));

export const usePage = () => useUIStore((state) => ({
  title: state.pageTitle,
  breadcrumbs: state.breadcrumbs,
  setTitle: state.setPageTitle,
  setBreadcrumbs: state.setBreadcrumbs,
}));

export const useResponsive = () => useUIStore((state) => ({
  isMobile: state.isMobile,
  isTablet: state.isTablet,
  setScreenSize: state.setScreenSize,
}));

export const useLoading = () => useUIStore((state) => ({
  isLoading: state.globalLoading,
  message: state.loadingMessage,
  setLoading: state.setGlobalLoading,
}));
