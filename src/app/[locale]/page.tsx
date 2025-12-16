'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaroquePattern, BaroqueDivider } from '@/components/BaroquePattern';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { ProductCard } from '@/components/ProductCard';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Home() {
  const tHome = useTranslations('home');
  const tCommon = useTranslations('common');

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
              backgroundImage: `url('/images/hero-image.jpg')`,
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
              <Link href="/shop">
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

      {/* Featured Products Section */}
      <section className="baroque-section bg-[var(--background-alt)] py-20">
        {/* Subtle baroque corners */}
        <BaroquePattern position="all" opacity={0.05} />
        <div className="container-elegant">
          <div className="mb-12 text-center">
            <span className="font-script text-2xl text-[var(--primary)] block mb-2">
              {tHome('featured.label')}
            </span>
            <h2 className="text-[var(--foreground)]">{tHome('featured.title')}</h2>
            <p className="mt-4 text-[var(--muted)] max-w-2xl mx-auto">
              {tHome('featured.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Product Card 1 - Cassettone Luigi XVI in Noce */}
            <Link href="/shop/cassettone-luigi-xvi-noce" className="block h-full">
              <ProductCard
                id="1"
                slug="cassettone-luigi-xvi-noce"
                title="Cassettone Luigi XVI in Noce"
                description="Elegante cassettone in stile Luigi XVI realizzato in noce massello con intarsi in bois de rose"
                price={4200}
                status="available"
                image="/images/product1.png"
                showBottomButton={false}
              />
            </Link>

            {/* Product Card 2 - Specchiera Impero Dorata */}
            <Link href="/shop/specchiera-impero-dorata" className="block h-full">
              <ProductCard
                id="2"
                slug="specchiera-impero-dorata"
                title="Specchiera Impero Dorata"
                description="Magnifica specchiera in stile Impero con cornice intagliata e dorata a foglia oro"
                price={3800}
                status="available"
                image="/images/product2-specchiera.png"
                showBottomButton={false}
              />
            </Link>

            {/* Product Card 3 - Tavolo Ottocento in Mogano */}
            <Link href="/shop/tavolo-ottocento-mogano" className="block h-full">
              <ProductCard
                id="3"
                slug="tavolo-ottocento-mogano"
                title="Tavolo Ottocento in Mogano"
                description="Elegante tavolo da pranzo allungabile in mogano cubano con gambe a balaustro tornito"
                price={5600}
                status="available"
                image="/images/product3-tavolo.png"
                showBottomButton={false}
              />
            </Link>
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
              <span className="font-script text-2xl text-[var(--primary)]">{tHome('about.label')}</span>
              <h2 className="mt-2 text-[var(--foreground)]">{tHome('about.title')}</h2>
              <p className="mt-6 leading-relaxed text-[var(--muted)]">
                {tHome('about.description')}
              </p>
              <p className="mt-4 leading-relaxed text-[var(--muted)]">
                {tHome('about.description2')}
              </p>
              <Link href="/about">
                <Button variant="ghost" className="mt-6">
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
                  <span className="font-script text-3xl text-[var(--primary)]">
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
