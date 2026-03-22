// =====================================================
// ZUSTAND STORE
// Global state management for the application
// =====================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =====================================================
// AUTH STORE
// =====================================================

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set user data after login
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null
        });
      },

      // Clear auth data on logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      // Update user profile
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// =====================================================
// BOOKING STORE
// Manages booking flow state
// =====================================================

export const useBookingStore = create((set, get) => ({
  // Search criteria
  searchCriteria: {
    checkIn: null,
    checkOut: null,
    guests: 1,
    roomTypeId: null
  },

  // Selected room
  selectedRoom: null,

  // Available rooms from search
  availableRooms: [],

  // Current booking step
  currentStep: 1,

  // Draft booking data
  draftBooking: {
    roomTypeId: null,
    checkInDate: null,
    checkOutDate: null,
    numberOfGuests: 1,
    specialRequests: '',
    guestInfo: {}
  },

  // Actions
  setSearchCriteria: (criteria) => {
    set((state) => ({
      searchCriteria: { ...state.searchCriteria, ...criteria }
    }));
  },

  setAvailableRooms: (rooms) => set({ availableRooms: rooms }),

  selectRoom: (room) => set({ selectedRoom: room }),

  clearSelectedRoom: () => set({ selectedRoom: null }),

  setCurrentStep: (step) => set({ currentStep: step }),

  updateDraftBooking: (data) => {
    set((state) => ({
      draftBooking: { ...state.draftBooking, ...data }
    }));
  },

  clearDraftBooking: () => {
    set({
      selectedRoom: null,
      currentStep: 1,
      draftBooking: {
        roomTypeId: null,
        checkInDate: null,
        checkOutDate: null,
        numberOfGuests: 1,
        specialRequests: '',
        guestInfo: {}
      }
    });
  },

  // Calculate number of nights
  getNights: () => {
    const { checkInDate, checkOutDate } = get().draftBooking;
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  },

  // Calculate total price
  getTotalPrice: () => {
    const { selectedRoom } = get();
    const nights = get().getNights();
    if (!selectedRoom || nights <= 0) return 0;
    return selectedRoom.basePrice * nights;
  }
}));

// =====================================================
// CART STORE (Food & Beverage)
// =====================================================

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    const existingIndex = items.findIndex((i) => i.id === item.id);

    if (existingIndex >= 0) {
      // Update quantity if exists
      const newItems = [...items];
      newItems[existingIndex].quantity += item.quantity;
      set({ items: newItems });
    } else {
      // Add new item
      set({ items: [...items, item] });
    }
  },

  updateQuantity: (id, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      set({ items: items.filter((i) => i.id !== id) });
    } else {
      set({
        items: items.map((i) => (i.id === id ? { ...i, quantity } : i))
      });
    }
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id)
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getTax: () => {
    return get().getSubtotal() * 0.08; // 8% tax
  },

  getTotal: () => {
    return get().getSubtotal() + get().getTax();
  }
}));

// =====================================================
// UI STORE
// =====================================================

export const useUIStore = create((set) => ({
  // Toast notifications
  toasts: [],

  // Modal state
  modal: {
    isOpen: false,
    component: null,
    props: {}
  },

  // Sidebar state (mobile)
  sidebarOpen: false,

  // Loading states
  globalLoading: false,

  // Actions
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));

    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, toast.duration || 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  openModal: (component, props = {}) => {
    set({
      modal: {
        isOpen: true,
        component,
        props
      }
    });
  },

  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        component: null,
        props: {}
      }
    });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setGlobalLoading: (loading) => set({ globalLoading: loading })
}));
