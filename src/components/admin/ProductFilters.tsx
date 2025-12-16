'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';

interface Category {
    id: string;
    displayName: string;
}

interface ProductFiltersProps {
    categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        startTransition(() => {
            router.push(`${pathname}?${createQueryString('search', value)}`);
        });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        startTransition(() => {
            router.push(`${pathname}?${createQueryString('category', value)}`);
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        startTransition(() => {
            router.push(`${pathname}?${createQueryString('status', value)}`);
        });
    };

    return (
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)] mb-6">
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <input
                        type="text"
                        placeholder="Cerca prodotti..."
                        defaultValue={searchParams.get('search') || ''}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                    />
                    {isPending && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <select
                    value={searchParams.get('category') || ''}
                    onChange={handleCategoryChange}
                    className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                >
                    <option value="">Tutte le Categorie</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                    ))}
                </select>
                <select
                    value={searchParams.get('status') || ''}
                    onChange={handleStatusChange}
                    className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--foreground)]"
                >
                    <option value="">Tutti gli Stati</option>
                    <option value="AVAILABLE">Disponibile</option>
                    <option value="SOLD">Venduto</option>
                    <option value="RESERVED">Riservato</option>
                    <option value="COMING_SOON">In Arrivo</option>
                </select>
            </div>
        </div>
    );
}
