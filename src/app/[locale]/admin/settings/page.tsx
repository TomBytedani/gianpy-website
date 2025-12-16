'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';

interface SiteSettings {
    // Business Info
    businessName: string;
    businessNameEn: string;
    tagline: string;
    taglineEn: string;
    vatNumber: string;
    fiscalCode: string;

    // Contact Details
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;

    // Social Media
    facebookUrl: string;
    instagramUrl: string;
    pinterestUrl: string;

    // Opening Hours
    openingHours: string;
    openingHoursEn: string;

    // Shipping Settings
    freeShippingThreshold: number;
    domesticShippingCost: number;
    internationalShippingCost: number;
    shippingNote: string;
    shippingNoteEn: string;

    // Email Settings
    orderConfirmationEnabled: boolean;
    wishlistNotificationsEnabled: boolean;
    contactFormNotificationEmail: string;
}

const defaultSettings: SiteSettings = {
    businessName: 'Antichità Barbaglia',
    businessNameEn: 'Barbaglia Antiques',
    tagline: 'Mobili antichi e restauro di pregio',
    taglineEn: 'Fine antique furniture and restoration',
    vatNumber: '',
    fiscalCode: '',

    email: 'info@antichitabarbaglia.com',
    phone: '+39 0323 123456',
    address: 'Via Roma, 123',
    city: 'Verbania',
    postalCode: '28921',
    country: 'Italia',

    facebookUrl: '',
    instagramUrl: '',
    pinterestUrl: '',

    openingHours: 'Lun-Ven: 9:00-12:30, 15:00-19:00\nSab: 9:00-12:30\nDom: Chiuso',
    openingHoursEn: 'Mon-Fri: 9:00 AM - 12:30 PM, 3:00 PM - 7:00 PM\nSat: 9:00 AM - 12:30 PM\nSun: Closed',

    freeShippingThreshold: 500,
    domesticShippingCost: 50,
    internationalShippingCost: 150,
    shippingNote: 'Spedizione gratuita per ordini superiori a €500. Consegna con trasportatore specializzato.',
    shippingNoteEn: 'Free shipping for orders over €500. Delivery with specialized carrier.',

    orderConfirmationEnabled: true,
    wishlistNotificationsEnabled: true,
    contactFormNotificationEmail: 'info@antichitabarbaglia.com',
};

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'business' | 'contact' | 'shipping' | 'email'>('business');

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('site-settings');
        if (savedSettings) {
            try {
                setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
            } catch {
                console.error('Failed to parse saved settings');
            }
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // For now, save to localStorage
            // In production, this would be an API call
            localStorage.setItem('site-settings', JSON.stringify(settings));

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setSaveMessage({ type: 'success', text: 'Impostazioni salvate con successo!' });
        } catch {
            setSaveMessage({ type: 'error', text: 'Impossibile salvare le impostazioni. Riprova.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Sei sicuro di voler ripristinare tutte le impostazioni ai valori predefiniti?')) {
            setSettings(defaultSettings);
            localStorage.removeItem('site-settings');
            setSaveMessage({ type: 'success', text: 'Impostazioni ripristinate ai valori predefiniti.' });
        }
    };

    const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaveMessage(null);
    };

    const tabs = [
        {
            id: 'business', label: 'Info Attività', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            )
        },
        {
            id: 'contact', label: 'Contatti', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'shipping', label: 'Spedizioni', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
            )
        },
        {
            id: 'email', label: 'Impostazioni Email', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        },
    ] as const;

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl text-[var(--foreground)]">Impostazioni</h1>
                    <p className="mt-1 text-[var(--muted)]">
                        Configura le impostazioni del negozio, le informazioni aziendali e le preferenze.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={handleReset}>
                        Ripristina Predefiniti
                    </Button>
                    <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </Button>
                </div>
            </div>

            {/* Save Message */}
            {saveMessage && (
                <div className={`mb-6 p-4 rounded-lg ${saveMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {saveMessage.text}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--border)] pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--foreground)] hover:bg-[var(--background-alt)]'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Business Info Tab */}
            {activeTab === 'business' && (
                <Card className="p-6">
                    <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Informazioni Attività</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Nome Attività (Italiano)
                            </label>
                            <input
                                type="text"
                                value={settings.businessName}
                                onChange={(e) => updateSetting('businessName', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Nome Attività (Inglese)
                            </label>
                            <input
                                type="text"
                                value={settings.businessNameEn}
                                onChange={(e) => updateSetting('businessNameEn', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Slogan (Italiano)
                            </label>
                            <input
                                type="text"
                                value={settings.tagline}
                                onChange={(e) => updateSetting('tagline', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Slogan (Inglese)
                            </label>
                            <input
                                type="text"
                                value={settings.taglineEn}
                                onChange={(e) => updateSetting('taglineEn', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Partita IVA (P.IVA)
                            </label>
                            <input
                                type="text"
                                value={settings.vatNumber}
                                onChange={(e) => updateSetting('vatNumber', e.target.value)}
                                className="input"
                                placeholder="IT12345678901"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Codice Fiscale (C.F.)
                            </label>
                            <input
                                type="text"
                                value={settings.fiscalCode}
                                onChange={(e) => updateSetting('fiscalCode', e.target.value)}
                                className="input"
                                placeholder="XXXXXXXXXXXXXXXX"
                            />
                        </div>
                    </div>

                    <h3 className="font-display text-lg text-[var(--foreground)] mt-8 mb-4">Orari di Apertura</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Orari di Apertura (Italiano)
                            </label>
                            <textarea
                                value={settings.openingHours}
                                onChange={(e) => updateSetting('openingHours', e.target.value)}
                                className="input min-h-[100px]"
                                rows={4}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Orari di Apertura (Inglese)
                            </label>
                            <textarea
                                value={settings.openingHoursEn}
                                onChange={(e) => updateSetting('openingHoursEn', e.target.value)}
                                className="input min-h-[100px]"
                                rows={4}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Contact Details Tab */}
            {activeTab === 'contact' && (
                <Card className="p-6">
                    <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Informazioni di Contatto</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Indirizzo Email
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => updateSetting('email', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Numero di Telefono
                            </label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => updateSetting('phone', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Indirizzo
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => updateSetting('address', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Città
                            </label>
                            <input
                                type="text"
                                value={settings.city}
                                onChange={(e) => updateSetting('city', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                CAP
                            </label>
                            <input
                                type="text"
                                value={settings.postalCode}
                                onChange={(e) => updateSetting('postalCode', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Paese
                            </label>
                            <input
                                type="text"
                                value={settings.country}
                                onChange={(e) => updateSetting('country', e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    <h3 className="font-display text-lg text-[var(--foreground)] mt-8 mb-4">Social Media</h3>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Facebook URL
                            </label>
                            <input
                                type="url"
                                value={settings.facebookUrl}
                                onChange={(e) => updateSetting('facebookUrl', e.target.value)}
                                className="input"
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Instagram URL
                            </label>
                            <input
                                type="url"
                                value={settings.instagramUrl}
                                onChange={(e) => updateSetting('instagramUrl', e.target.value)}
                                className="input"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Pinterest URL
                            </label>
                            <input
                                type="url"
                                value={settings.pinterestUrl}
                                onChange={(e) => updateSetting('pinterestUrl', e.target.value)}
                                className="input"
                                placeholder="https://pinterest.com/..."
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
                <Card className="p-6">
                    <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Impostazioni Spedizione</h2>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Soglia Spedizione Gratuita (€)
                            </label>
                            <input
                                type="number"
                                value={settings.freeShippingThreshold}
                                onChange={(e) => updateSetting('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                                className="input"
                                min={0}
                                step={10}
                            />
                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Ordini superiori a questo importo hanno spedizione gratuita
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Costo Spedizione Nazionale (€)
                            </label>
                            <input
                                type="number"
                                value={settings.domesticShippingCost}
                                onChange={(e) => updateSetting('domesticShippingCost', parseFloat(e.target.value) || 0)}
                                className="input"
                                min={0}
                                step={5}
                            />
                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Costo spedizione in Italia
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Costo Spedizione Internazionale (€)
                            </label>
                            <input
                                type="number"
                                value={settings.internationalShippingCost}
                                onChange={(e) => updateSetting('internationalShippingCost', parseFloat(e.target.value) || 0)}
                                className="input"
                                min={0}
                                step={10}
                            />
                            <p className="mt-1 text-xs text-[var(--muted)]">
                                Costo spedizione verso paesi UE
                            </p>
                        </div>
                    </div>

                    <h3 className="font-display text-lg text-[var(--foreground)] mt-8 mb-4">Note Spedizione</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Nota Spedizione (Italiano)
                            </label>
                            <textarea
                                value={settings.shippingNote}
                                onChange={(e) => updateSetting('shippingNote', e.target.value)}
                                className="input min-h-[100px]"
                                rows={4}
                                placeholder="Note sulla spedizione visualizzate nel checkout..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Nota Spedizione (Inglese)
                            </label>
                            <textarea
                                value={settings.shippingNoteEn}
                                onChange={(e) => updateSetting('shippingNoteEn', e.target.value)}
                                className="input min-h-[100px]"
                                rows={4}
                                placeholder="Shipping note displayed in checkout..."
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Email Settings Tab */}
            {activeTab === 'email' && (
                <Card className="p-6">
                    <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Notifiche Email</h2>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-[var(--background-alt)] rounded-lg">
                            <div>
                                <h3 className="font-medium text-[var(--foreground)]">Email Conferma Ordine</h3>
                                <p className="text-sm text-[var(--muted)]">
                                    Invia automaticamente email di conferma quando un cliente completa un ordine
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.orderConfirmationEnabled}
                                    onChange={(e) => updateSetting('orderConfirmationEnabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[var(--background-alt)] rounded-lg">
                            <div>
                                <h3 className="font-medium text-[var(--foreground)]">Notifiche Lista Desideri</h3>
                                <p className="text-sm text-[var(--muted)]">
                                    Avvisa gli utenti quando un articolo in lista desideri diventa disponibile o viene venduto
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.wishlistNotificationsEnabled}
                                    onChange={(e) => updateSetting('wishlistNotificationsEnabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                Email Notifiche Modulo Contatto
                            </label>
                            <input
                                type="email"
                                value={settings.contactFormNotificationEmail}
                                onChange={(e) => updateSetting('contactFormNotificationEmail', e.target.value)}
                                className="input"
                                placeholder="Dove ricevere le richieste dal modulo contatto"
                            />
                            <p className="mt-1 text-xs text-[var(--muted)]">
                                I messaggi dal modulo contatto saranno inviati a questo indirizzo email
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-medium text-blue-800">Configurazione Email</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Le email vengono inviate tramite Resend. Assicurati di aver configurato la variabile d'ambiente RESEND_API_KEY affinché l'invio email funzioni correttamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Footer with Save Button */}
            <div className="mt-8 flex justify-end gap-3 border-t border-[var(--border)] pt-6">
                <Button variant="secondary" onClick={handleReset}>
                    Ripristina Predefiniti
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvataggio...
                        </>
                    ) : 'Salva Modifiche'}
                </Button>
            </div>
        </div>
    );
}
