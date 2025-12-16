'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge, Button, Input } from '@/components/ui';
import { ProductCard } from '@/components/ProductCard';
import { useTranslations, useLocale } from 'next-intl';

// Product type from database
interface Product {
    id: string;
    slug: string;
    title: string;
    titleEn: string | null;
    description: string;
    descriptionEn: string | null;
    price: number;
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'COMING_SOON';
    category: {
        name: string;
        displayName: string;
        displayNameEn: string | null;
    } | null;
    images: {
        id: string;
        url: string;
        alt: string | null;
        isPrimary: boolean;
    }[];
}

// Map database status to UI status
function mapStatus(status: string): 'available' | 'sold' | 'reserved' | 'coming-soon' {
    switch (status) {
        case 'AVAILABLE':
            return 'available';
        case 'SOLD':
            return 'sold';
        case 'RESERVED':
            return 'reserved';
        case 'COMING_SOON':
            return 'coming-soon';
        default:
            return 'available';
    }
}

// FilterSidebar props interface - defined outside to avoid re-creation on each render
interface FilterSidebarProps {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    priceRange: { min: string; max: string };
    setPriceRange: (value: { min: string; max: string }) => void;
    clearFilters: () => void;
    tShop: ReturnType<typeof useTranslations<'shop'>>;
}

// FilterSidebar component - defined OUTSIDE of ShopPage to prevent re-creation on each render
// This is critical to maintain input focus when typing in the MIN/MAX price fields
function FilterSidebar({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    priceRange,
    setPriceRange,
    clearFilters,
    tShop,
}: FilterSidebarProps) {
    return (
        <div className="space-y-6">
            {/* Search */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">{tShop('filters.category')}</label>
                <Input
                    placeholder={tShop('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category Filter */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-3">{tShop('filters.category')}</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            value="all"
                            checked={selectedCategory === 'all'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                            {tShop('filters.allCategories')}
                        </span>
                    </label>
                    {['cassettoni', 'specchiere', 'tavoli', 'sedie', 'credenze'].map((cat) => (
                        <label
                            key={cat}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="radio"
                                name="category"
                                value={cat}
                                checked={selectedCategory === cat}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                                {tShop(`categories.${cat}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Status Filter */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-3">{tShop('filters.status')}</label>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="radio"
                            name="status"
                            value="all"
                            checked={selectedStatus === 'all'}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                            {tShop('filters.allStatuses')}
                        </span>
                    </label>
                    {['available', 'sold', 'coming-soon'].map((status) => (
                        <label
                            key={status}
                            className="flex items-center gap-2 cursor-pointer group"
                        >
                            <input
                                type="radio"
                                name="status"
                                value={status}
                                checked={selectedStatus === status}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-4 h-4 text-[var(--primary)] border-[var(--border)] focus:ring-[var(--primary)]"
                            />
                            <span className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">
                                {tShop(`statusOptions.${status}`)}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-3">{tShop('filters.price')}</label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder={tShop('filters.priceMin')}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                    <span className="text-[var(--muted)] self-center">—</span>
                    <Input
                        type="number"
                        placeholder={tShop('filters.priceMax')}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                </div>
            </div>

            {/* Clear Filters */}
            <Button variant="ghost" onClick={clearFilters} className="w-full">
                {tShop('filters.clearAll')}
            </Button>
        </div>
    );
}

export default function ShopPage() {
    const tShop = useTranslations('shop');
    const locale = useLocale();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortOption, setSortOption] = useState('newest');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from API
    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/products');

                if (!response.ok) {
                    setError('Failed to fetch products');
                    return;
                }

                const data = await response.json();
                setProducts(data.products || []);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    // Get localized content
    const getLocalizedTitle = (product: Product) => {
        return locale === 'en' && product.titleEn ? product.titleEn : product.title;
    };

    const getLocalizedDescription = (product: Product) => {
        return locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
    };

    // Filter products
    const filteredProducts = products.filter((product) => {
        const categoryName = product.category?.name || '';
        const uiStatus = mapStatus(product.status);

        if (selectedCategory !== 'all' && categoryName !== selectedCategory) return false;
        if (selectedStatus !== 'all' && uiStatus !== selectedStatus) return false;

        const title = getLocalizedTitle(product).toLowerCase();
        if (searchQuery && !title.includes(searchQuery.toLowerCase())) return false;

        if (priceRange.min && product.price < parseInt(priceRange.min)) return false;
        if (priceRange.max && product.price > parseInt(priceRange.max)) return false;
        return true;
    });

    // Sort products based on selected option
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'name':
                return getLocalizedTitle(a).localeCompare(getLocalizedTitle(b));
            case 'newest':
            default:
                // For 'newest', we rely on the original order from API (assumed to be by createdAt desc)
                // If products have a createdAt field, we could sort by that
                return 0;
        }
    });

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedStatus('all');
        setSearchQuery('');
        setPriceRange({ min: '', max: '' });
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <Header />

            {/* Page Header */}
            <section className="pt-28 pb-12 bg-[var(--background-alt)]">
                <div className="container-elegant">
                    <div className="text-center">
                        <span className="font-display text-2xl text-[var(--primary)] block mb-2">{tShop('title')}</span>
                        <h1 className="text-[var(--foreground)]">{tShop('pageTitle')}</h1>
                        <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
                            {tShop('subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="container-elegant">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden">
                            <Button
                                variant="secondary"
                                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                                className="w-full"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                                {tShop('filters.title')}
                            </Button>

                            {/* Mobile Filter Panel */}
                            {isMobileFilterOpen && (
                                <div className="mt-4 p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg animate-fade-in">
                                    <FilterSidebar
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        selectedCategory={selectedCategory}
                                        setSelectedCategory={setSelectedCategory}
                                        selectedStatus={selectedStatus}
                                        setSelectedStatus={setSelectedStatus}
                                        priceRange={priceRange}
                                        setPriceRange={setPriceRange}
                                        clearFilters={clearFilters}
                                        tShop={tShop}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24 p-6 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                                <h3 className="font-display italic text-lg text-[var(--foreground)] mb-6">{tShop('filters.title')}</h3>
                                <FilterSidebar
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    selectedStatus={selectedStatus}
                                    setSelectedStatus={setSelectedStatus}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    clearFilters={clearFilters}
                                    tShop={tShop}
                                />
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <main className="flex-1">
                            {/* Results count */}
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-[var(--muted)]">
                                    {loading ? '...' : tShop('results', { count: sortedProducts.length })}
                                </p>
                                <select
                                    className="text-sm text-[var(--muted)] bg-transparent border border-[var(--border)] rounded px-3 py-2 focus:outline-none focus:border-[var(--primary)]"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="newest">{tShop('sort.newest')}</option>
                                    <option value="price-asc">{tShop('sort.priceLowHigh')}</option>
                                    <option value="price-desc">{tShop('sort.priceHighLow')}</option>
                                    <option value="name">{tShop('sort.nameAZ')}</option>
                                </select>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="text-center py-16">
                                    <p className="text-[var(--muted)]">{error}</p>
                                    <Button variant="secondary" onClick={() => window.location.reload()} className="mt-4">
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {/* Products */}
                            {!loading && !error && sortedProducts.length > 0 && (
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                    {sortedProducts.map((product) => {
                                        const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                                        return (
                                            <Link key={product.id} href={`/shop/${product.slug}`}>
                                                <ProductCard
                                                    id={product.id}
                                                    slug={product.slug}
                                                    title={getLocalizedTitle(product)}
                                                    description={getLocalizedDescription(product)}
                                                    price={product.price}
                                                    status={mapStatus(product.status)}
                                                    image={primaryImage?.url || '/images/product-placeholder.png'}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {/* No Results */}
                            {!loading && !error && sortedProducts.length === 0 && (
                                <div className="text-center py-16">
                                    <svg
                                        className="w-16 h-16 mx-auto text-[var(--muted)] mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-display italic text-[var(--foreground)] mb-2">
                                        {tShop('noResults')}
                                    </h3>
                                    <p className="text-[var(--muted)]">
                                        {tShop('tryAdjustingFilters')}
                                    </p>
                                    <Button variant="secondary" onClick={clearFilters} className="mt-4">
                                        {tShop('filters.clearAll')}
                                    </Button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}
