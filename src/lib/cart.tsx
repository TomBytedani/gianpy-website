'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// =========================================
// TYPES
// =========================================

export interface CartItem {
    id: string;         // Product ID
    title: string;      // Product title (snapshot at add time)
    titleEn?: string;   // English title
    price: number;      // Price (snapshot at add time)
    slug: string;       // Product slug for navigation
    imageUrl?: string;  // Primary image URL
    quantity: number;   // Typically 1 for unique antique items
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'COMING_SOON';
    // Shipping overrides (optional - null means use global settings)
    shippingCost?: number | null;      // Custom domestic shipping cost
    shippingCostIntl?: number | null;  // Custom international shipping cost
    requiresSpecialShipping?: boolean; // Flag for fragile/oversized items
    shippingNote?: string | null;      // Special shipping note (IT)
    shippingNoteEn?: string | null;    // Special shipping note (EN)
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;    // For cart drawer/modal
    isLoading: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
    | { type: 'REMOVE_ITEM'; payload: { id: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_CART'; payload: CartItem[] }
    | { type: 'TOGGLE_CART'; payload?: boolean }
    | { type: 'SET_LOADING'; payload: boolean };

interface CartContextType extends CartState {
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: (isOpen?: boolean) => void;
    getItemCount: () => number;
    getSubtotal: () => number;
    isInCart: (id: string) => boolean;
}

// =========================================
// CONSTANTS
// =========================================

const CART_STORAGE_KEY = 'bottega-cart';

// =========================================
// INITIAL STATE
// =========================================

const initialState: CartState = {
    items: [],
    isOpen: false,
    isLoading: true,
};

// =========================================
// REDUCER
// =========================================

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            // For antique items, each is unique - no stacking
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                // Item already in cart - don't add duplicate
                return state;
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }],
            };
        }

        case 'REMOVE_ITEM': {
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id),
            };
        }

        case 'UPDATE_QUANTITY': {
            // For unique items, quantity should typically stay at 1
            // But we keep this for flexibility
            if (action.payload.quantity <= 0) {
                return {
                    ...state,
                    items: state.items.filter(item => item.id !== action.payload.id),
                };
            }
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        }

        case 'CLEAR_CART': {
            return {
                ...state,
                items: [],
            };
        }

        case 'SET_CART': {
            return {
                ...state,
                items: action.payload,
                isLoading: false,
            };
        }

        case 'TOGGLE_CART': {
            return {
                ...state,
                isOpen: action.payload ?? !state.isOpen,
            };
        }

        case 'SET_LOADING': {
            return {
                ...state,
                isLoading: action.payload,
            };
        }

        default:
            return state;
    }
}

// =========================================
// CONTEXT
// =========================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// =========================================
// PROVIDER
// =========================================

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const items = JSON.parse(savedCart) as CartItem[];
                dispatch({ type: 'SET_CART', payload: items });
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    // Persist cart to localStorage whenever items change
    useEffect(() => {
        if (!state.isLoading) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [state.items, state.isLoading]);

    // Action handlers
    const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    }, []);

    const removeItem = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const toggleCart = useCallback((isOpen?: boolean) => {
        dispatch({ type: 'TOGGLE_CART', payload: isOpen });
    }, []);

    const getItemCount = useCallback(() => {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    }, [state.items]);

    const getSubtotal = useCallback(() => {
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [state.items]);

    const isInCart = useCallback((id: string) => {
        return state.items.some(item => item.id === id);
    }, [state.items]);

    const value: CartContextType = {
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        getItemCount,
        getSubtotal,
        isInCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// =========================================
// HOOK
// =========================================

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

export function formatPrice(price: number, locale: string = 'it-IT'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}
