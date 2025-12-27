'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

type ProductListItemProps = {
    product: {
        id: string;
        title: string;
        slug: string;
        price: number;
        status: string;
        isFeatured: boolean;
        category: {
            displayName: string;
        } | null;
        images: {
            url: string;
        }[];
    };
};

const statusColors: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    SOLD: 'bg-gray-100 text-gray-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    COMING_SOON: 'bg-blue-100 text-blue-800',
};

export default function ProductListItem({ product }: ProductListItemProps) {
    const router = useRouter();
    const locale = useLocale();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete product');
            }

            // Refresh the page to show updated list
            router.refresh();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete product');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            {/* Mobile Card Layout */}
            <div className="lg:hidden bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] space-y-3">
                <div className="flex items-start gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg bg-[var(--background)] overflow-hidden flex-shrink-0">
                        {product.images[0] ? (
                            <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-body text-[var(--foreground)] truncate">{product.title}</p>
                        <p className="text-sm text-[var(--muted)]">{product.category?.displayName || '—'}</p>
                        <p className="font-body text-[var(--primary)] mt-1">
                            €{Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[product.status]}`}>
                            {product.status.replace('_', ' ')}
                        </span>
                        {product.isFeatured && (
                            <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                    <Link
                        href={`/${locale}/admin/products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] bg-[var(--background)] rounded-lg hover:bg-[var(--border)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifica
                    </Link>
                    <Link
                        href={`/shop/${product.slug}`}
                        target="_blank"
                        className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        title="Visualizza"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Elimina"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Desktop Table Row */}
            <tr className="hidden lg:table-row hover:bg-[var(--background)] transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[var(--background)] overflow-hidden flex-shrink-0">
                            {product.images[0] ? (
                                <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-body text-[var(--foreground)]">{product.title}</p>
                            <p className="text-sm text-[var(--muted)]">{product.slug}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-[var(--muted)]">
                    {product.category?.displayName || '—'}
                </td>
                <td className="px-6 py-4 font-body">
                    €{Number(product.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusColors[product.status]}`}>
                        {product.status.replace('_', ' ')}
                    </span>
                </td>
                <td className="px-6 py-4">
                    {product.isFeatured ? (
                        <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    )}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/${locale}/admin/products/${product.id}/edit`}
                            className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                            title="Modifica"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Link>
                        <Link
                            href={`/shop/${product.slug}`}
                            className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                            title="Visualizza"
                            target="_blank"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isDeleting}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Elimina"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--surface)] rounded-xl p-6 max-w-md w-full border border-[var(--border)] shadow-xl">
                        <h3 className="font-display text-xl text-[var(--foreground)] mb-4">
                            Conferma Eliminazione
                        </h3>
                        <p className="text-[var(--muted)] mb-6">
                            Sei sicuro di voler eliminare <strong className="text-[var(--foreground)]">{product.title}</strong>?
                            Questa azione non può essere annullata.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--background)] transition-colors disabled:opacity-50"
                            >
                                Annulla
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Eliminando...
                                    </>
                                ) : (
                                    'Elimina'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
