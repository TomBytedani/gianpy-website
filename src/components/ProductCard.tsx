'use client';

import { Card, CardContent, Badge } from '@/components/ui';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export interface ProductCardProps {
    id: string;
    slug: string;
    title: string;
    description?: string;
    price: number;
    status: 'available' | 'sold' | 'reserved' | 'coming-soon';
    image?: string;
    showBottomButton?: boolean;
}


/**
 * Status badge for the bottom of the card (consistent, uppercase styling)
 */
function getStatusBadge(status: string, t: ReturnType<typeof useTranslations<'common'>>) {
    switch (status) {
        case 'available':
            return <Badge variant="success">{t('status.available')}</Badge>;
        case 'sold':
            return <Badge variant="sold">{t('status.sold')}</Badge>;
        case 'reserved':
            return <Badge variant="warning">{t('status.reserved')}</Badge>;
        case 'coming-soon':
            return <Badge variant="coming-soon">{t('status.comingSoon')}</Badge>;
        default:
            return null;
    }
}

/**
 * Get the button text based on product status
 */
function getButtonText(status: string, t: ReturnType<typeof useTranslations<'common'>>) {
    switch (status) {
        case 'available':
            return t('buttons.viewDetails');
        case 'sold':
            return t('status.notAvailable');
        default:
            return t('buttons.moreInfo');
    }
}

export function ProductCard({
    title,
    description,
    price,
    status,
    image,
    showBottomButton = true,
}: ProductCardProps) {
    const t = useTranslations('common');

    const isSold = status === 'sold';

    return (
        <Card hoverable className="group h-full flex flex-col">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale-[30%]' : ''
                            }`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZDRjNWE5Ii8+PC9zdmc+"
                    />
                ) : (
                    <div
                        className={`w-full h-full bg-gradient-to-br from-[#d4c5a9] to-[#b8a67d] flex items-center justify-center group-hover:scale-105 transition-transform duration-500 ${isSold ? 'grayscale-[30%]' : ''
                            }`}
                    >
                        <svg
                            className="w-16 h-16 text-[var(--background)]/40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <rect x="2" y="6" width="20" height="12" rx="1" strokeWidth="1" />
                            <path d="M6 18v2M18 18v2M2 12h20" strokeWidth="1" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Content Section - Uses flex-grow to push footer to bottom */}
            <CardContent className="flex flex-col flex-grow p-5">
                {/* Title - Always in foreground color */}
                <h3 className="text-lg font-display italic text-[var(--foreground)]">
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Spacer to push price/status to bottom */}
                <div className="flex-grow min-h-4" />

                {/* Price and Status Row - Always at bottom */}
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <span
                        className={`text-xl font-medium ${isSold
                            ? 'text-[var(--muted)] line-through'
                            : 'text-[var(--primary)]'
                            }`}
                    >
                        €{price.toLocaleString()}
                    </span>
                    {getStatusBadge(status, t)}
                </div>

                {/* Action Button */}
                {showBottomButton && (
                    <div
                        className={`w-full mt-4 text-center py-2 rounded text-sm font-medium transition-colors ${status === 'available'
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--background-alt)] text-[var(--muted)]'
                            }`}
                    >
                        {getButtonText(status, t)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ProductCard;
