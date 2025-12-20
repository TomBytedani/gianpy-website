'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// =========================================
// TYPES
// =========================================

export interface SiteSettings {
    id: string;
    // Business Info
    businessName: string;
    businessNameEn: string;
    tagline: string;
    taglineEn: string;
    openingHours: string;
    openingHoursEn: string;
    // Contact Info
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    // Social Media URLs
    facebookUrl: string | null;
    instagramUrl: string | null;
    whatsappUrl: string | null;
    // Shipping Configuration
    freeShippingThreshold: number;
    domesticShippingCost: number;
    internationalShippingCost: number;
    shippingNotes: string | null;
    shippingNotesEn: string | null;
    // Email Settings
    orderConfirmationEnabled: boolean;
    wishlistNotificationsEnabled: boolean;
    contactFormNotificationEmail: string;
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    // Computed helpers
    getFullAddress: () => string;
    getOpeningHours: (locale: string) => string[];
    getBusinessName: (locale: string) => string;
    getTagline: (locale: string) => string;
    getShippingNotes: (locale: string) => string | null;
    calculateShipping: (subtotal: number, isInternational?: boolean) => number;
    isFreeShipping: (subtotal: number) => boolean;
    // Cart-aware shipping calculation (with product overrides)
    calculateCartShipping: (cartItems: CartItemForShipping[], subtotal: number, isInternational?: boolean) => number;
    getCartShippingNotes: (cartItems: CartItemForShipping[], locale: string) => string[];
    hasSpecialShippingItems: (cartItems: CartItemForShipping[]) => boolean;
}

// Type for cart items with shipping info
export interface CartItemForShipping {
    shippingCost?: number | null;
    shippingCostIntl?: number | null;
    requiresSpecialShipping?: boolean;
    shippingNote?: string | null;
    shippingNoteEn?: string | null;
}

// =========================================
// DEFAULT VALUES (fallbacks while loading)
// =========================================

const DEFAULT_SETTINGS: SiteSettings = {
    id: 'default',
    businessName: 'Antichità Barbaglia',
    businessNameEn: 'Barbaglia Antiques',
    tagline: 'Mobili antichi e restauro di pregio',
    taglineEn: 'Fine antique furniture and restoration',
    openingHours: 'Lun-Ven: 9:00-12:30, 15:00-19:00\nSab: 9:00-12:30\nDom: Chiuso',
    openingHoursEn: 'Mon-Fri: 9:00 AM - 12:30 PM, 3:00 PM - 7:00 PM\nSat: 9:00 AM - 12:30 PM\nSun: Closed',
    email: 'info@antichitabarbaglia.com',
    phone: '+39 0323 123456',
    address: 'Via Roma, 123',
    city: 'Verbania',
    postalCode: '28921',
    country: 'Italia',
    facebookUrl: null,
    instagramUrl: null,
    whatsappUrl: null,
    freeShippingThreshold: 500,
    domesticShippingCost: 50,
    internationalShippingCost: 150,
    shippingNotes: null,
    shippingNotesEn: null,
    orderConfirmationEnabled: true,
    wishlistNotificationsEnabled: true,
    contactFormNotificationEmail: 'info@antichitabarbaglia.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// =========================================
// CONTEXT
// =========================================

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// =========================================
// CACHE
// =========================================

// Simple in-memory cache to avoid refetching on every mount
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// =========================================
// PROVIDER
// =========================================

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(cachedSettings);
    const [isLoading, setIsLoading] = useState(!cachedSettings);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        // Check if cache is still valid
        const now = Date.now();
        if (cachedSettings && (now - cacheTimestamp) < CACHE_DURATION) {
            setSettings(cachedSettings);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/settings', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();

            // Update cache
            cachedSettings = data;
            cacheTimestamp = Date.now();

            setSettings(data);
        } catch (err) {
            console.error('Error fetching site settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch settings');
            // Use default settings as fallback
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Helper: Get full formatted address
    const getFullAddress = useCallback(() => {
        if (!settings) return '';
        return `${settings.address}, ${settings.postalCode} ${settings.city}, ${settings.country}`;
    }, [settings]);

    // Helper: Get opening hours as array for the specified locale
    const getOpeningHours = useCallback((locale: string) => {
        if (!settings) return [];
        const hours = locale === 'en' ? settings.openingHoursEn : settings.openingHours;
        return hours.split('\n').filter(line => line.trim());
    }, [settings]);

    // Helper: Get business name for locale
    const getBusinessName = useCallback((locale: string) => {
        if (!settings) return DEFAULT_SETTINGS.businessName;
        return locale === 'en' ? settings.businessNameEn : settings.businessName;
    }, [settings]);

    // Helper: Get tagline for locale
    const getTagline = useCallback((locale: string) => {
        if (!settings) return DEFAULT_SETTINGS.tagline;
        return locale === 'en' ? settings.taglineEn : settings.tagline;
    }, [settings]);

    // Helper: Get shipping notes for locale
    const getShippingNotes = useCallback((locale: string) => {
        if (!settings) return null;
        return locale === 'en' ? settings.shippingNotesEn : settings.shippingNotes;
    }, [settings]);

    // Helper: Calculate shipping cost
    const calculateShipping = useCallback((subtotal: number, isInternational = false) => {
        // Use current settings or fallback to defaults during loading
        const currentSettings = settings || DEFAULT_SETTINGS;

        // Free shipping above threshold
        if (subtotal >= currentSettings.freeShippingThreshold) {
            return 0;
        }

        return isInternational ? currentSettings.internationalShippingCost : currentSettings.domesticShippingCost;
    }, [settings]);

    // Helper: Check if order qualifies for free shipping
    const isFreeShipping = useCallback((subtotal: number) => {
        // Use current settings or fallback to defaults during loading
        const currentSettings = settings || DEFAULT_SETTINGS;
        return subtotal >= currentSettings.freeShippingThreshold;
    }, [settings]);

    // Helper: Calculate shipping for cart items with product-level overrides
    const calculateCartShipping = useCallback((cartItems: CartItemForShipping[], subtotal: number, isInternational = false) => {
        const currentSettings = settings || DEFAULT_SETTINGS;

        // Free shipping above threshold
        if (subtotal >= currentSettings.freeShippingThreshold) {
            return 0;
        }

        // Get global default shipping
        const globalShipping = isInternational
            ? currentSettings.internationalShippingCost
            : currentSettings.domesticShippingCost;

        // Check for product-level overrides - use MAX strategy
        const shippingCosts = cartItems.map(item => {
            const itemShipping = isInternational
                ? (item.shippingCostIntl ?? null)
                : (item.shippingCost ?? null);
            return itemShipping !== null ? itemShipping : globalShipping;
        });

        // Return the maximum shipping cost (most expensive item determines shipping)
        return shippingCosts.length > 0 ? Math.max(...shippingCosts) : globalShipping;
    }, [settings]);

    // Helper: Get special shipping notes from cart items
    const getCartShippingNotes = useCallback((cartItems: CartItemForShipping[], locale: string) => {
        const notes: string[] = [];

        for (const item of cartItems) {
            const note = locale === 'en' ? item.shippingNoteEn : item.shippingNote;
            if (note && !notes.includes(note)) {
                notes.push(note);
            }
        }

        return notes;
    }, []);

    // Helper: Check if any cart items require special shipping
    const hasSpecialShippingItems = useCallback((cartItems: CartItemForShipping[]) => {
        return cartItems.some(item => item.requiresSpecialShipping);
    }, []);

    const value: SiteSettingsContextType = {
        settings,
        isLoading,
        error,
        refetch: fetchSettings,
        getFullAddress,
        getOpeningHours,
        getBusinessName,
        getTagline,
        getShippingNotes,
        calculateShipping,
        isFreeShipping,
        calculateCartShipping,
        getCartShippingNotes,
        hasSpecialShippingItems,
    };

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

// =========================================
// HOOK
// =========================================

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);
    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
}

// Export default settings for use in SSR or outside of provider context
export { DEFAULT_SETTINGS };
