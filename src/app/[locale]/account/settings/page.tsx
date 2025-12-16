'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
}

interface UserPreferences {
    orderUpdates: boolean;
    wishlistAlerts: boolean;
    newsletter: boolean;
}

export default function AccountSettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const t = useTranslations('account');

    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
    });

    const [preferences, setPreferences] = useState<UserPreferences>({
        orderUpdates: true,
        wishlistAlerts: true,
        newsletter: false,
    });

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [preferencesMessage, setPreferencesMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (session?.user) {
            setProfile({
                name: session.user.name || '',
                email: session.user.email || '',
                phone: '',
            });
        }
    }, [session]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setProfileMessage(null);

        try {
            // In a real implementation, this would call an API endpoint
            // For now, we'll just simulate a successful update
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update session with new name
            await updateSession({ name: profile.name });

            setProfileMessage({ type: 'success', text: t('settings.updateSuccess') });
        } catch (error) {
            console.error('Error updating profile:', error);
            setProfileMessage({ type: 'error', text: t('settings.updateError') });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handlePreferencesSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPreferences(true);
        setPreferencesMessage(null);

        try {
            // In a real implementation, this would call an API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));

            setPreferencesMessage({ type: 'success', text: t('settings.updateSuccess') });
        } catch (error) {
            console.error('Error updating preferences:', error);
            setPreferencesMessage({ type: 'error', text: t('settings.updateError') });
        } finally {
            setIsSavingPreferences(false);
        }
    };

    return (
        <div className="max-w-2xl">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="font-display italic font-semibold text-3xl md:text-4xl text-foreground">
                    {t('settings.title')}
                </h1>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-border bg-background-alt">
                    <h2 className="font-display italic text-lg text-foreground">
                        {t('settings.profile')}
                    </h2>
                </div>
                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground font-body mb-2">
                            {t('settings.name')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-white font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder={t('settings.namePlaceholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground font-body mb-2">
                            {t('settings.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background-alt font-body text-muted cursor-not-allowed"
                        />
                        <p className="text-xs text-muted mt-1 font-body">
                            {t('settings.emailCannotBeChanged')}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-foreground font-body mb-2">
                            {t('settings.phone')}
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-white font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder={t('settings.phonePlaceholder')}
                        />
                    </div>

                    {profileMessage && (
                        <div className={`p-4 rounded-lg ${profileMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="text-sm font-body">{profileMessage.text}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        disabled={isSavingProfile}
                    >
                        {isSavingProfile ? (
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('settings.updating')}
                            </span>
                        ) : (
                            t('settings.updateProfile')
                        )}
                    </Button>
                </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-background-alt">
                    <h2 className="font-display italic text-lg text-foreground">
                        {t('settings.emailNotifications')}
                    </h2>
                </div>
                <form onSubmit={handlePreferencesSubmit} className="p-6 space-y-4">
                    <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-background-alt transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.orderUpdates}
                            onChange={(e) => setPreferences({ ...preferences, orderUpdates: e.target.checked })}
                            className="mt-1 w-5 h-5 text-primary border-border rounded focus:ring-primary"
                        />
                        <div>
                            <p className="font-body font-medium text-foreground">
                                {t('settings.orderUpdates')}
                            </p>
                            <p className="text-sm text-muted font-body">
                                {t('settings.orderUpdatesDescription')}
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-background-alt transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.wishlistAlerts}
                            onChange={(e) => setPreferences({ ...preferences, wishlistAlerts: e.target.checked })}
                            className="mt-1 w-5 h-5 text-primary border-border rounded focus:ring-primary"
                        />
                        <div>
                            <p className="font-body font-medium text-foreground">
                                {t('settings.wishlistAlerts')}
                            </p>
                            <p className="text-sm text-muted font-body">
                                {t('settings.wishlistAlertsDescription')}
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-background-alt transition-colors cursor-pointer">
                        <input
                            type="checkbox"
                            checked={preferences.newsletter}
                            onChange={(e) => setPreferences({ ...preferences, newsletter: e.target.checked })}
                            className="mt-1 w-5 h-5 text-primary border-border rounded focus:ring-primary"
                        />
                        <div>
                            <p className="font-body font-medium text-foreground">
                                {t('settings.newsletter')}
                            </p>
                            <p className="text-sm text-muted font-body">
                                {t('settings.newsletterDescription')}
                            </p>
                        </div>
                    </label>

                    {preferencesMessage && (
                        <div className={`p-4 rounded-lg ${preferencesMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="text-sm font-body">{preferencesMessage.text}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={isSavingPreferences}
                        >
                            {isSavingPreferences ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('settings.updating')}
                                </span>
                            ) : (
                                t('settings.savePreferences')
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-8 bg-red-50 rounded-lg border border-red-200 p-6">
                <h3 className="font-display text-lg text-red-800 mb-2">
                    {t('settings.dangerZone')}
                </h3>
                <p className="text-sm text-red-700 font-body mb-4">
                    {t('settings.dangerZoneDescription')}
                </p>
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-body text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={() => {
                        if (confirm(t('settings.deleteAccountConfirm'))) {
                            // Handle account deletion
                            alert(t('settings.deleteAccountComingSoon'));
                        }
                    }}
                >
                    {t('settings.deleteAccount')}
                </button>
            </div>
        </div>
    );
}
