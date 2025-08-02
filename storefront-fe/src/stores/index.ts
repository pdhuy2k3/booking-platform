// Store exports for easy importing
export * from './search-store';
export * from './booking-store';
export * from './ui-store';
export * from './auth-store';

// Re-export commonly used hooks
export {
  useSearchStore,
  useSearchCriteria,
  useSearchResults,
  useSearchLoading,
  useSearchError,
  useSearchFilters,
  useActiveFiltersCount,
  useSearchUI,
} from './search-store';

export {
  useBookingStore,
  useBookingStep,
  useBookingFormData,
  useBookingSelections,
  useBookingPricing,
  useBookingStatus,
} from './booking-store';

export {
  useUIStore,
  useTheme,
  useSidebar,
  useNotifications,
  useModals,
  useNavigation,
  usePage,
  useResponsive,
  useLoading,
} from './ui-store';

export {
  useAuthStore,
  useUser,
  useAuth,
  useAuthStatus,
  usePermissions,
} from './auth-store';
