'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, Badge, Button } from '@/components/ui';
import { useCart } from '@/lib/cart';
import { useTranslations, useLocale } from 'next-intl';

// Product type from database
interface Product {
    id: string;
    title: string;
    titleEn: string | null;
    slug: string;
    description: string;
    descriptionEn: string | null;
    price: number;
    status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'COMING_SOON';
    dimensions: string | null;
    materials: string | null;
    materialsEn: string | null;
    condition: string | null;
    conditionEn: string | null;
    provenance: string | null;
    provenanceEn: string | null;
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

function getStatusBadge(status: string, t: ReturnType<typeof useTranslations<'common'>>) {
    switch (status) {
        case 'AVAILABLE':
            return <Badge variant="success">{t('status.available')}</Badge>;
        case 'SOLD':
            return (
                <Badge variant="sold" useScript>
                    {t('status.sold')}
                </Badge>
            );
        case 'RESERVED':
            return <Badge variant="warning">{t('status.reserved')}</Badge>;
        case 'COMING_SOON':
            return <Badge variant="coming-soon">{t('status.comingSoon')}</Badge>;
        default:
            return null;
    }
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const slug = params.slug as string;
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem, isInCart, removeItem } = useCart();
    const { data: session, status: authStatus } = useSession();
    const t = useTranslations('product');
    const tCommon = useTranslations('common');

    // Product state
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Wishlist state
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false);
    const [wishlistError, setWishlistError] = useState<string | null>(null);

    // Fetch product from API
    useEffect(() => {
        async function fetchProduct() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/api/products/by-slug/${slug}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('not_found');
                    } else {
                        setError('fetch_error');
                    }
                    return;
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('fetch_error');
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    // Set initial selected image to the primary image when product loads
    useEffect(() => {
        if (product?.images && product.images.length > 0) {
            const primaryIndex = product.images.findIndex(img => img.isPrimary);
            if (primaryIndex !== -1) {
                setSelectedImage(primaryIndex);
            }
        }
    }, [product?.images]);

    // Check if product is in wishlist when page loads
    useEffect(() => {
        async function checkWishlistStatus() {
            // Only check if user is authenticated and we have a product
            if (authStatus !== 'authenticated' || !product?.id) {
                return;
            }

            try {
                const response = await fetch(`/api/wishlist/${product.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setWishlistAdded(data.inWishlist);
                }
            } catch (err) {
                console.error('Error checking wishlist status:', err);
            }
        }

        checkWishlistStatus();
    }, [product?.id, authStatus]);

    const inCart = product ? isInCart(product.id) : false;

    // Get localized content
    const getLocalizedTitle = () => {
        if (!product) return '';
        return locale === 'en' && product.titleEn ? product.titleEn : product.title;
    };

    const getLocalizedDescription = () => {
        if (!product) return '';
        return locale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
    };

    const getLocalizedCategoryName = () => {
        if (!product?.category) return '';
        return locale === 'en' && product.category.displayNameEn
            ? product.category.displayNameEn
            : product.category.displayName;
    };

    const getLocalizedMaterials = () => {
        if (!product) return '';
        return locale === 'en' && product.materialsEn ? product.materialsEn : product.materials;
    };

    const getLocalizedCondition = () => {
        if (!product) return '';
        return locale === 'en' && product.conditionEn ? product.conditionEn : product.condition;
    };

    const getLocalizedProvenance = () => {
        if (!product) return '';
        return locale === 'en' && product.provenanceEn ? product.provenanceEn : product.provenance;
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem({
            id: product.id,
            title: product.title,           // Always store Italian (primary)
            titleEn: product.titleEn || undefined, // Store English if available
            price: product.price,
            slug: product.slug,
            imageUrl: product.images[0]?.url,
            status: product.status,
        });
    };

    const handleRemoveFromCart = () => {
        if (!product) return;
        removeItem(product.id);
    };

    const handleAddToWishlist = async () => {
        if (!product) return;

        // Redirect to sign in if not authenticated
        if (authStatus !== 'authenticated' || !session?.user) {
            router.push(`/auth/signin?callbackUrl=/shop/${product.slug}`);
            return;
        }

        setWishlistLoading(true);
        setWishlistError(null);

        try {
            // Set notification preferences based on status
            const notifyOnSale = product.status === 'AVAILABLE' || product.status === 'RESERVED';
            const notifyOnAvailable = product.status === 'COMING_SOON' || product.status === 'RESERVED';

            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.id,
                    notifyOnSale,
                    notifyOnPriceChange: false,
                }),
            });

            if (response.ok) {
                setWishlistAdded(true);
            } else if (response.status === 409) {
                // Already in wishlist
                setWishlistAdded(true);
            } else {
                const data = await response.json();
                setWishlistError(data.error || 'Failed to add to wishlist');
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            setWishlistError('Failed to add to wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    // Get wishlist button text based on product status
    const getWishlistButtonText = () => {
        if (wishlistAdded) return t('inWishlist');
        if (product?.status === 'COMING_SOON') return t('notifyWhenAvailable');
        if (product?.status === 'RESERVED') return t('watchItem');
        return t('addToWishlist');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <Header />
                <main className="pt-28 pb-20">
                    <div className="container-elegant">
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Error or not found state
    if (error || !product) {
        return (
            <div className="min-h-screen bg-[var(--background)]">
                <Header />
                <main className="pt-28 pb-20">
                    <div className="container-elegant">
                        <div className="text-center py-20">
                            <h1 className="text-3xl text-[var(--foreground)]">{t('notFound')}</h1>
                            <p className="mt-4 text-[var(--muted)]">
                                {t('notFoundMessage')}
                            </p>
                            <Link href="/shop">
                                <Button variant="primary" className="mt-8">
                                    {t('backToShop')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const isSold = product.status === 'SOLD';

    // Get images - use placeholder if no images
    const productImages = product.images.length > 0
        ? product.images
        : [{ id: 'placeholder', url: '/images/product-placeholder.png', alt: getLocalizedTitle(), isPrimary: true }];
    const currentImage = productImages[selectedImage] ?? productImages[0];

    // Generate JSON-LD structured data for SEO
    const getAvailabilitySchema = () => {
        switch (product.status) {
            case 'AVAILABLE':
                return 'https://schema.org/InStock';
            case 'SOLD':
                return 'https://schema.org/SoldOut';
            case 'RESERVED':
                return 'https://schema.org/LimitedAvailability';
            case 'COMING_SOON':
                return 'https://schema.org/PreOrder';
            default:
                return 'https://schema.org/InStock';
        }
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${baseUrl}/${locale}/shop/${product.slug}`;
    const primaryImage = productImages.find(img => img.isPrimary) || productImages[0];
    const imageUrl = primaryImage?.url.startsWith('http')
        ? primaryImage.url
        : `${baseUrl}${primaryImage?.url}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: getLocalizedTitle(),
        description: getLocalizedDescription(),
        image: productImages.map(img =>
            img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`
        ),
        url: productUrl,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'Antichità Barbaglia',
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EUR',
            availability: getAvailabilitySchema(),
            url: productUrl,
            seller: {
                '@type': 'Organization',
                name: 'Antichità Barbaglia',
            },
        },
        ...(product.category && {
            category: getLocalizedCategoryName(),
        }),
        ...(product.materials && {
            material: product.materials,
        }),
        ...(product.condition && {
            itemCondition: 'https://schema.org/UsedCondition',
        }),
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* JSON-LD Structured Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />

            <main className="pt-28 pb-20">
                <div className="container-elegant">
                    {/* Breadcrumb */}
                    <nav className="mb-8 text-sm text-[var(--muted)]">
                        <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                            {tCommon('nav.home')}
                        </Link>
                        <span className="mx-2">/</span>
                        <Link href="/shop" className="hover:text-[var(--primary)] transition-colors">
                            {tCommon('nav.shop')}
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-[var(--foreground)]">{getLocalizedTitle()}</span>
                    </nav>

                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div
                                className={`relative aspect-square rounded-lg overflow-hidden ${isSold ? 'grayscale-[30%]' : ''}`}
                            >
                                {currentImage ? (
                                    <Image
                                        src={currentImage.url}
                                        alt={currentImage.alt || getLocalizedTitle()}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[#d4c5a9] to-[#b8a67d] flex items-center justify-center">
                                        <svg
                                            className="w-24 h-24 text-[var(--background)]/40"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                        >
                                            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1" />
                                            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1" />
                                            <path d="M21 15l-5-5L5 21" strokeWidth="1" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails - 2x2 grid on mobile, 4 columns on larger screens */}
                            {productImages.length > 1 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {productImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${selectedImage === index
                                                ? 'border-[var(--primary)]'
                                                : 'border-transparent hover:border-[var(--border)]'
                                                }`}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={image.url}
                                                    alt={image.alt || getLocalizedTitle()}
                                                    fill
                                                    className={`object-cover ${product.status === 'SOLD' ? 'grayscale-[30%]' : ''}`}
                                                    sizes="(max-width: 768px) 80px, 120px"
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div>
                            {/* Status Badge */}
                            <div className="mb-4">{getStatusBadge(product.status, tCommon)}</div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl text-[var(--foreground)]">{getLocalizedTitle()}</h1>

                            {/* Price */}
                            <div className="mt-6">
                                <span
                                    className={`text-3xl font-bold ${isSold ? 'text-[var(--muted)] line-through' : 'text-[var(--primary)]'
                                        }`}
                                >
                                    €{product.price.toLocaleString()}
                                </span>
                            </div>

                            {/* Description */}
                            <div className="mt-8">
                                <h2 className="text-lg font-display italic text-[var(--foreground)] mb-3">
                                    {t('description')}
                                </h2>
                                <p className="text-[var(--muted)] leading-relaxed">{getLocalizedDescription()}</p>
                            </div>

                            {/* Details */}
                            <Card className="mt-8 bg-[var(--background-alt)]" padding="lg">
                                <h2 className="text-lg font-display italic text-[var(--foreground)] mb-4">
                                    {t('details')}
                                </h2>
                                <dl className="space-y-3 text-sm">
                                    {product.dimensions && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <dt className="text-[var(--muted)]">{t('dimensions')}</dt>
                                            <dd className="text-[var(--foreground)] sm:text-right">{product.dimensions}</dd>
                                        </div>
                                    )}
                                    {(product.materials || product.materialsEn) && (
                                        <div className="border-t border-[var(--border)] pt-3 flex flex-col sm:flex-row sm:justify-between">
                                            <dt className="text-[var(--muted)]">{t('materials')}</dt>
                                            <dd className="text-[var(--foreground)] sm:text-right sm:max-w-[60%]">
                                                {getLocalizedMaterials()}
                                            </dd>
                                        </div>
                                    )}
                                    {(product.condition || product.conditionEn) && (
                                        <div className="border-t border-[var(--border)] pt-3 flex flex-col sm:flex-row sm:justify-between">
                                            <dt className="text-[var(--muted)]">{t('condition')}</dt>
                                            <dd className="text-[var(--foreground)] sm:text-right sm:max-w-[60%]">
                                                {getLocalizedCondition()}
                                            </dd>
                                        </div>
                                    )}
                                    {(product.provenance || product.provenanceEn) && (
                                        <div className="border-t border-[var(--border)] pt-3 flex flex-col sm:flex-row sm:justify-between">
                                            <dt className="text-[var(--muted)]">{t('provenance')}</dt>
                                            <dd className="text-[var(--foreground)] sm:text-right sm:max-w-[60%]">
                                                {getLocalizedProvenance()}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </Card>

                            {/* Action Buttons */}
                            <div className="mt-8 space-y-4">
                                {product.status === 'AVAILABLE' && (
                                    <>
                                        {inCart ? (
                                            <>
                                                <div className="flex gap-3">
                                                    <Button
                                                        variant="secondary"
                                                        className="flex-1"
                                                        size="lg"
                                                        onClick={handleRemoveFromCart}
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
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                        {t('remove')}
                                                    </Button>
                                                    <Link href="/cart" className="flex-1">
                                                        <Button variant="primary" className="w-full" size="lg">
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
                                                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                                />
                                                            </svg>
                                                            {t('goToCart')}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                className="w-full"
                                                size="lg"
                                                onClick={handleAddToCart}
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
                                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                                    />
                                                </svg>
                                                {t('addToCart')}
                                            </Button>
                                        )}
                                        <Button
                                            variant={wishlistAdded ? "primary" : "secondary"}
                                            className="w-full"
                                            onClick={handleAddToWishlist}
                                            disabled={wishlistLoading || wishlistAdded}
                                        >
                                            {wishlistLoading ? (
                                                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 mr-2"
                                                    fill={wishlistAdded ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                            )}
                                            {getWishlistButtonText()}
                                        </Button>
                                        {wishlistError && (
                                            <p className="text-sm text-red-500 mt-2">{wishlistError}</p>
                                        )}
                                    </>
                                )}

                                {product.status === 'SOLD' && (
                                    <div className="text-center p-6 bg-[var(--background-alt)] rounded-lg">
                                        <p className="text-[var(--muted)]">
                                            {t('soldMessage')}
                                        </p>
                                        <Link href="/contact">
                                            <Button variant="secondary" className="mt-4">
                                                {t('contactUs')}
                                            </Button>
                                        </Link>
                                    </div>
                                )}

                                {(product.status === 'RESERVED' || product.status === 'COMING_SOON') && (
                                    <>
                                        <div className="text-center p-6 bg-[var(--background-alt)] rounded-lg">
                                            <p className="text-[var(--muted)]">
                                                {product.status === 'RESERVED' ? t('reservedMessage') : t('comingSoonMessage')}
                                            </p>
                                            <Link href="/contact">
                                                <Button variant="secondary" className="mt-4">
                                                    {t('contactUs')}
                                                </Button>
                                            </Link>
                                        </div>
                                        <Button
                                            variant={wishlistAdded ? "primary" : "secondary"}
                                            className="w-full"
                                            onClick={handleAddToWishlist}
                                            disabled={wishlistLoading || wishlistAdded}
                                        >
                                            {wishlistLoading ? (
                                                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 mr-2"
                                                    fill={wishlistAdded ? "currentColor" : "none"}
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                            )}
                                            {getWishlistButtonText()}
                                        </Button>
                                        {wishlistError && (
                                            <p className="text-sm text-red-500 mt-2">{wishlistError}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Contact Prompt */}
                            <div className="mt-8 p-4 border border-[var(--border)] rounded-lg">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                                        <svg
                                            className="w-5 h-5 text-[var(--primary)]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[var(--foreground)]">{t('haveQuestions')}</h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {t('questionsDescription')}
                                        </p>
                                        <Link
                                            href="/contact"
                                            className="inline-block mt-2 text-sm text-[var(--primary)] hover:underline"
                                        >
                                            {t('sendRequest')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
