'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaroquePattern, BaroqueDivider } from '@/components/BaroquePattern';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { ProductCard } from '@/components/ProductCard';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

// R2 public URL for static assets
const R2_PUBLIC_URL = 'https://pub-c08ae0de86f94e598029df0900cc46b3.r2.dev';

// Type for featured product from API
type FeaturedProduct = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  price: number;
  status: string;
  images: { url: string; isPrimary: boolean }[];
};

// Loading skeleton for product cards
function ProductCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-[var(--background-alt)]" />
      <div className="p-6">
        <div className="h-6 bg-[var(--background-alt)] rounded mb-3 w-3/4" />
        <div className="h-4 bg-[var(--background-alt)] rounded mb-2 w-full" />
        <div className="h-4 bg-[var(--background-alt)] rounded mb-4 w-2/3" />
        <div className="h-8 bg-[var(--background-alt)] rounded w-1/3" />
      </div>
    </div>
  );
}

export default function Home() {
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured products on mount
  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/products?featured=true&limit=3');
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }

        const data = await response.json();
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load featured products');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedProducts();
  }, []);

  // Helper to get localized content
  const getLocalizedContent = (it: string, en: string | null) => {
    if (locale === 'en' && en) return en;
    return it;
  };

  // Get primary image or first image
  const getProductImage = (product: FeaturedProduct) => {
    const primaryImage = product.images.find((img) => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || '/images/placeholder.jpg';
  };

  // Map API status to ProductCard status format
  const mapStatusForCard = (status: string): 'available' | 'sold' | 'reserved' | 'coming-soon' => {
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
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <Header />

      {/* Hero Section - Full Width with Background Image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Hero Background */}
        <div className="absolute inset-0">
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/95 via-[var(--background)]/70 to-[var(--background)]/30 z-10" />
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${R2_PUBLIC_URL}/hero-image.jpg')`,
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container-elegant">
          <div className="max-w-2xl">
            {/* Script accent label */}
            <span className="font-display text-3xl md:text-4xl text-[var(--primary)] block mb-4">
              {tHome('hero.label')}
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[var(--foreground)] mb-6">
              {tHome('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl leading-relaxed text-[var(--foreground)]/80 mb-10 max-w-xl" style={{ textShadow: '0 1px 2px rgba(255,254,249,0.8)' }}>
              {tHome('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/services">
                <Button variant="primary" size="lg">
                  {tHome('hero.cta')}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  {tCommon('buttons.contactUs')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-2 text-[var(--muted)] animate-bounce">
            <span className="text-xs uppercase tracking-widest">{tHome('hero.scroll')}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="container-elegant">
          <div className="mb-12 text-center">
            <span className="font-display text-2xl text-[var(--primary)] block mb-2">
              {tHome('services.label')}
            </span>
            <h2 className="text-[var(--foreground)]">{tHome('services.title')}</h2>
            <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
              {tHome('services.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Restauro Card */}
            <Link href="/services#restauro" className="group block">
              <Card className="h-full text-center hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg" padding="lg">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display italic text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{tHome('services.restauro.title')}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {tHome('services.restauro.description')}
                </p>
              </Card>
            </Link>

            {/* Manifattura Card */}
            <Link href="/services#manifattura" className="group block">
              <Card className="h-full text-center hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg" padding="lg">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-display italic text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{tHome('services.manifattura.title')}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {tHome('services.manifattura.description')}
                </p>
              </Card>
            </Link>

            {/* Compra-Vendita Card */}
            <Link href="/services#compravendita" className="group block">
              <Card className="h-full text-center hover:border-[var(--primary)] transition-all duration-300 hover:shadow-lg" padding="lg">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center group-hover:bg-[var(--primary)]/20 transition-colors">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-display italic text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">{tHome('services.compravendita.title')}</h3>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {tHome('services.compravendita.description')}
                </p>
              </Card>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="secondary">{tHome('services.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="baroque-section bg-[var(--background-alt)] py-20">
        {/* Subtle baroque corners */}
        <BaroquePattern position="all" opacity={0.05} />
        <div className="container-elegant">
          <div className="mb-12 text-center">
            <span className="font-display text-2xl text-[var(--primary)] block mb-2">
              {tHome('featured.label')}
            </span>
            <h2 className="text-[var(--foreground)]">{tHome('featured.title')}</h2>
            <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
              {tHome('featured.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Loading state */}
            {isLoading && (
              <>
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </>
            )}

            {/* Error state */}
            {!isLoading && error && (
              <div className="col-span-full text-center py-12">
                <p className="text-[var(--muted)]">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 text-[var(--primary)] hover:underline"
                >
                  {tCommon('buttons.retry') || 'Riprova'}
                </button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && featuredProducts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-[var(--muted)]">{tHome('featured.empty') || 'Nessun prodotto in evidenza al momento.'}</p>
              </div>
            )}

            {/* Dynamic featured products */}
            {!isLoading && !error && featuredProducts.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="block h-full">
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  title={getLocalizedContent(product.title, product.titleEn)}
                  description={getLocalizedContent(product.description, product.descriptionEn)}
                  price={product.price}
                  status={mapStatusForCard(product.status)}
                  image={getProductImage(product)}
                  showBottomButton={false}
                />
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/shop">
              <Button variant="secondary">{tHome('featured.viewAll')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container-elegant">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="font-display text-2xl text-[var(--primary)]">{tHome('about.label')}</span>
              <h2 className="mt-2 text-[var(--foreground)]">{tHome('about.title')}</h2>
              <p className="mt-6 leading-relaxed text-[var(--muted)]">
                {tHome('about.description')}
              </p>
              <p className="mt-4 leading-relaxed text-[var(--muted)]">
                {tHome('about.description2')}
              </p>
              <Link href="/about">
                <Button variant="primary" className="mt-6">
                  {tCommon('buttons.learnMore')} →
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[var(--background-alt)]" padding="lg">
                <div className="text-center">
                  <span className="text-4xl font-bold text-[var(--primary)]">30+</span>
                  <p className="mt-2 text-sm text-[var(--muted)]">{tHome('about.experience')}</p>
                </div>
              </Card>
              <Card className="bg-[var(--background-alt)]" padding="lg">
                <div className="text-center">
                  <span className="text-4xl font-bold text-[var(--primary)]">500+</span>
                  <p className="mt-2 text-sm text-[var(--muted)]">{tHome('about.restored')}</p>
                </div>
              </Card>
              <Card className="col-span-2 bg-[var(--background-alt)]" padding="lg">
                <div className="text-center">
                  <span className="font-display text-3xl text-[var(--primary)]">
                    {tHome('about.italian')}
                  </span>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {tHome('about.quality')}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
