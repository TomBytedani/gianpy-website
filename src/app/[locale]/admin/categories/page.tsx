'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

type Category = {
    id: string;
    name: string;
    displayName: string;
    displayNameEn?: string | null;
    description?: string | null;
    sortOrder: number;
    _count?: { products: number };
};

export default function AdminCategoriesPage() {
    const locale = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        displayNameEn: '',
        description: '',
        sortOrder: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create category');
            }

            setFormData({ name: '', displayName: '', displayNameEn: '', description: '', sortOrder: 0 });
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const generateName = (displayName: string) => {
        return displayName
            .toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    return (
        <div className="pt-16">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl text-[var(--foreground)]">Categorie</h1>
                    <p className="mt-1 text-[var(--muted)]">
                        Gestisci le categorie dei prodotti
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Aggiungi Categoria
                </button>
            </div>

            {/* Add Category Form */}
            {showForm && (
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] mb-6">
                    <h2 className="font-display text-xl text-[var(--foreground)] mb-4">Nuova Categoria</h2>

                    {error && (
                        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                                    Nome Visualizzato (Italiano) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        displayName: e.target.value,
                                        name: formData.name || generateName(e.target.value),
                                    })}
                                    required
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Cassettoni e Comò"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                                    Nome Visualizzato (Inglese)
                                </label>
                                <input
                                    type="text"
                                    value={formData.displayNameEn}
                                    onChange={(e) => setFormData({ ...formData, displayNameEn: e.target.value })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="Chests and Dressers"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                                    Nome Macchina *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: generateName(e.target.value) })}
                                    required
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    placeholder="cassettoni"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                                    Ordine
                                </label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                                Descrizione
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {submitting ? 'Creazione...' : 'Crea Categoria'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-[var(--muted)]">Caricamento...</div>
                ) : categories.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--background)]">
                                <tr className="text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4">Nome (EN)</th>
                                    <th className="px-6 py-4">Nome Macchina</th>
                                    <th className="px-6 py-4">Prodotti</th>
                                    <th className="px-6 py-4">Ordine</th>
                                    <th className="px-6 py-4">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-[var(--background)] transition-colors">
                                        <td className="px-6 py-4 font-body text-[var(--foreground)]">
                                            {category.displayName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--muted)]">
                                            {category.displayNameEn || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm bg-[var(--background)] px-2 py-1 rounded">
                                                {category.name}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {category._count?.products || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--muted)]">
                                            {category.sortOrder}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                                    title="Modifica"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-2">Nessuna categoria ancora</h3>
                        <p className="text-[var(--muted)]">Crea la tua prima categoria per organizzare i prodotti</p>
                    </div>
                )}
            </div>
        </div>
    );
}
