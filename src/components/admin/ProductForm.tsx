'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import MultiImageUpload from './MultiImageUpload';
import SortableImageGrid, { type ImageItem } from './SortableImageGrid';

// Maximum allowed featured products
const MAX_FEATURED_PRODUCTS = 3;

type Category = {
    id: string;
    displayName: string;
};

type ProductImage = {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
};

type ProductFormProps = {
    categories: Category[];
    initialData?: {
        id?: string;
        title: string;
        titleEn: string;
        slug: string;
        description: string;
        descriptionEn: string;
        price: number;
        status: string;
        categoryId: string;
        dimensions: string;
        materials: string;
        materialsEn: string;
        condition: string;
        conditionEn: string;
        provenance: string;
        provenanceEn: string;
        isFeatured: boolean;
        images?: ProductImage[];
        // Shipping overrides
        shippingCost?: number | null;
        shippingCostIntl?: number | null;
        requiresSpecialShipping?: boolean;
        shippingNote?: string;
        shippingNoteEn?: string;
    };
};

export default function ProductForm({ categories, initialData }: ProductFormProps) {
    const router = useRouter();
    const locale = useLocale();
    const isEditing = !!initialData?.id;

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        titleEn: initialData?.titleEn || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        descriptionEn: initialData?.descriptionEn || '',
        price: initialData?.price || 0,
        status: initialData?.status || 'AVAILABLE',
        categoryId: initialData?.categoryId || '',
        dimensions: initialData?.dimensions || '',
        materials: initialData?.materials || '',
        materialsEn: initialData?.materialsEn || '',
        condition: initialData?.condition || '',
        conditionEn: initialData?.conditionEn || '',
        provenance: initialData?.provenance || '',
        provenanceEn: initialData?.provenanceEn || '',
        isFeatured: initialData?.isFeatured || false,
        // Shipping overrides
        shippingCost: initialData?.shippingCost ?? null as number | null,
        shippingCostIntl: initialData?.shippingCostIntl ?? null as number | null,
        requiresSpecialShipping: initialData?.requiresSpecialShipping || false,
        shippingNote: initialData?.shippingNote || '',
        shippingNoteEn: initialData?.shippingNoteEn || '',
    });

    // Unified image type - single array preserves order for drag-and-drop
    type UnifiedImage = {
        id: string;           // For existing: database id, For new: tempId
        url: string;
        alt: string | null;
        isPrimary: boolean;
        isNew: boolean;       // true = uploaded this session, false = from database
        key?: string;         // R2 key, only for new images
        originalId?: string;  // Original database id for existing images
        sortOrder: number;    // Position in the list
    };

    const [images, setImages] = useState<UnifiedImage[]>(() => {
        // Initialize from existing images
        return (initialData?.images || []).map((img, index) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary,
            isNew: false,
            originalId: img.id,
            sortOrder: index,
        }));
    });
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Featured products count management
    const [featuredCount, setFeaturedCount] = useState(0);
    const [featuredWarning, setFeaturedWarning] = useState<string | null>(null);

    // Fetch current featured products count on mount
    useEffect(() => {
        async function fetchFeaturedCount() {
            try {
                const response = await fetch('/api/products?featured=true&limit=100');
                if (response.ok) {
                    const data = await response.json();
                    setFeaturedCount(data.total || 0);
                }
            } catch (err) {
                console.error('Failed to fetch featured count:', err);
            }
        }
        fetchFeaturedCount();
    }, []);

    // Handle featured checkbox change with validation
    const handleFeaturedChange = (checked: boolean) => {
        setFeaturedWarning(null);

        if (checked) {
            // Calculate how many featured products there would be if we enable this
            // If this product was already featured, the count includes it, so no change needed
            const willExceed = !initialData?.isFeatured && featuredCount >= MAX_FEATURED_PRODUCTS;

            if (willExceed) {
                setFeaturedWarning(`È possibile avere al massimo ${MAX_FEATURED_PRODUCTS} prodotti in evidenza. Rimuovi un prodotto dalla vetrina prima di aggiungerne un altro.`);
                return; // Don't allow checking the box
            }
        }

        setFormData({ ...formData, isFeatured: checked });
    };

    // Calculate available slots
    const usedSlots = initialData?.isFeatured
        ? featuredCount // This product is already counted
        : formData.isFeatured
            ? featuredCount + 1 // We just added it (would be added)
            : featuredCount; // Not featured

    // Handle new image upload (single)
    const handleImageUpload = (image: { url: string; key: string; filename: string }) => {
        const isPrimary = images.length === 0;
        setImages((prev) => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                url: image.url,
                alt: null,
                isPrimary,
                isNew: true,
                key: image.key,
                sortOrder: prev.length,
            },
        ]);
    };

    // Handle multiple image uploads (batch)
    const handleMultiImageUpload = (uploadedImages: { url: string; key: string; filename: string }[]) => {
        const hasPrimary = images.some((img) => img.isPrimary);

        setImages((prev) => [
            ...prev,
            ...uploadedImages.map((image, index) => ({
                id: `new-${Date.now()}-${index}`,
                url: image.url,
                alt: null as string | null,
                // First image is primary if no images have primary set
                isPrimary: !hasPrimary && prev.length === 0 && index === 0,
                isNew: true,
                key: image.key,
                sortOrder: prev.length + index,
            })),
        ]);
    };

    // Remove image (works for both existing and new)
    const handleRemoveImage = (imageId: string) => {
        const imageToRemove = images.find((img) => img.id === imageId);
        if (!imageToRemove) return;

        const wasImagePrimary = imageToRemove.isPrimary;

        // If it's an existing image, mark for deletion
        if (!imageToRemove.isNew && imageToRemove.originalId) {
            setImagesToDelete((prev) => [...prev, imageToRemove.originalId!]);
        }

        // Remove from array and update sortOrder
        let remainingImages = images
            .filter((img) => img.id !== imageId)
            .map((img, index) => ({ ...img, sortOrder: index }));

        // If the removed image was primary, promote the first remaining image
        if (wasImagePrimary && remainingImages.length > 0) {
            remainingImages = remainingImages.map((img, index) => ({
                ...img,
                isPrimary: index === 0,
            }));
        }

        setImages(remainingImages);
    };

    // Set primary image
    const handleSetPrimary = (imageId: string) => {
        setImages((prev) =>
            prev.map((img) => ({ ...img, isPrimary: img.id === imageId }))
        );
    };

    // Combined images for the sortable grid - just use the unified array directly
    const allImages: ImageItem[] = images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        isNew: img.isNew,
    }));

    // Handle image reordering from drag-and-drop - now simple since we use one array!
    const handleReorderImages = (reorderedImages: ImageItem[]) => {
        // Create a map of the new order
        const orderMap = new Map(reorderedImages.map((img, index) => [img.id, index]));

        // Reorder the unified array based on the new order
        const reordered = [...images]
            .sort((a, b) => {
                const orderA = orderMap.get(a.id) ?? 0;
                const orderB = orderMap.get(b.id) ?? 0;
                return orderA - orderB;
            })
            .map((img, index) => ({ ...img, sortOrder: index }));

        setImages(reordered);
    };

    // Generate slug from title
    const generateSlug = (title: string) => {
        return title
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((prev) => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const endpoint = isEditing
                ? `/api/products/${initialData.id}`
                : '/api/products';

            const method = isEditing ? 'PUT' : 'POST';

            // Prepare image data for submission - split unified array back for API
            const newImagesForApi = images
                .filter((img) => img.isNew)
                .map((img, index) => ({
                    url: img.url,
                    isPrimary: img.isPrimary,
                    sortOrder: img.sortOrder,
                }));

            const existingImagesForApi = images
                .filter((img) => !img.isNew)
                .map((img) => ({
                    id: img.originalId || img.id,
                    isPrimary: img.isPrimary,
                    sortOrder: img.sortOrder,
                }));

            const imageData = {
                newImages: newImagesForApi,
                existingImages: existingImagesForApi,
                imagesToDelete,
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    images: imageData,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save product');
            }

            router.push(`/${locale}/admin/products`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Title (Italian) *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            required
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Cassettone Luigi XVI"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Title (English)
                        </label>
                        <input
                            type="text"
                            value={formData.titleEn}
                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Louis XVI Chest of Drawers"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Slug *
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                            required
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="cassettone-luigi-xvi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Category
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                        Description (Italian) *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                        placeholder="Elegante cassettone in noce intarsiato..."
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                        Description (English)
                    </label>
                    <textarea
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                        placeholder="Elegant Louis XVI walnut chest of drawers..."
                    />
                </div>
            </div>

            {/* Pricing & Status */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Pricing & Status</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Price (EUR) *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">€</span>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Status *
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="RESERVED">Reserved</option>
                            <option value="SOLD">Sold</option>
                            <option value="COMING_SOON">Coming Soon</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isFeatured}
                                onChange={(e) => handleFeaturedChange(e.target.checked)}
                                className="w-5 h-5 accent-[var(--primary)]"
                            />
                            <span className="font-body text-[var(--foreground)]">Featured Product</span>
                        </label>
                        {/* Featured slots indicator */}
                        <span className={`text-sm ${usedSlots >= MAX_FEATURED_PRODUCTS ? 'text-amber-600' : 'text-[var(--muted)]'}`}>
                            {usedSlots}/{MAX_FEATURED_PRODUCTS} slot in evidenza utilizzati
                        </span>
                        {/* Warning message */}
                        {featuredWarning && (
                            <p className="text-sm text-red-600">{featuredWarning}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Physical Details */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Physical Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Dimensions
                        </label>
                        <input
                            type="text"
                            value={formData.dimensions}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="120 x 80 x 45 cm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Materials (Italian)
                        </label>
                        <input
                            type="text"
                            value={formData.materials}
                            onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Noce, intarsi in bois de rose"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Materials (English)
                        </label>
                        <input
                            type="text"
                            value={formData.materialsEn}
                            onChange={(e) => setFormData({ ...formData, materialsEn: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Walnut, bois de rose inlays"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Condition (Italian)
                        </label>
                        <input
                            type="text"
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Eccellente - restauro conservativo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Condition (English)
                        </label>
                        <input
                            type="text"
                            value={formData.conditionEn}
                            onChange={(e) => setFormData({ ...formData, conditionEn: e.target.value })}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Excellent - conservative restoration"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Provenance (Italian)
                        </label>
                        <textarea
                            value={formData.provenance}
                            onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            placeholder="Provenienza: Villa privata in Toscana"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Provenance (English)
                        </label>
                        <textarea
                            value={formData.provenanceEn}
                            onChange={(e) => setFormData({ ...formData, provenanceEn: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            placeholder="Provenance: Private villa in Tuscany"
                        />
                    </div>
                </div>
            </div>

            {/* Shipping Override (Optional) */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl text-[var(--foreground)]">Shipping Override</h2>
                    <span className="text-sm text-[var(--muted)]">Optional - leave empty to use global settings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Custom Domestic Shipping (EUR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">€</span>
                            <input
                                type="number"
                                value={formData.shippingCost ?? ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    shippingCost: e.target.value ? parseFloat(e.target.value) : null
                                })}
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                placeholder="Use global default"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Custom International Shipping (EUR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">€</span>
                            <input
                                type="number"
                                value={formData.shippingCostIntl ?? ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    shippingCostIntl: e.target.value ? parseFloat(e.target.value) : null
                                })}
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                placeholder="Use global default"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.requiresSpecialShipping}
                                onChange={(e) => setFormData({ ...formData, requiresSpecialShipping: e.target.checked })}
                                className="w-5 h-5 accent-[var(--primary)]"
                            />
                            <span className="font-body text-[var(--foreground)]">Requires Special Shipping</span>
                            <span className="text-sm text-[var(--muted)]">(fragile, oversized, or special handling)</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Shipping Note (Italian)
                        </label>
                        <textarea
                            value={formData.shippingNote}
                            onChange={(e) => setFormData({ ...formData, shippingNote: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            placeholder="Es: Richiede trasporto specializzato per mobili d'epoca"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-body text-[var(--foreground)] mb-2">
                            Shipping Note (English)
                        </label>
                        <textarea
                            value={formData.shippingNoteEn}
                            onChange={(e) => setFormData({ ...formData, shippingNoteEn: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                            placeholder="E.g.: Requires specialized antique furniture transport"
                        />
                    </div>
                </div>
            </div>

            {/* Product Images */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
                <h2 className="font-display text-xl text-[var(--foreground)] mb-6">Product Images</h2>

                {/* Current Images (sortable) */}
                {allImages.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-body text-[var(--muted)] mb-3">
                            Current Images {images.filter(img => img.isNew).length > 0 && <span className="text-green-600">({images.filter(img => img.isNew).length} new)</span>}
                        </p>
                        <SortableImageGrid
                            images={allImages}
                            onReorder={handleReorderImages}
                            onSetPrimary={handleSetPrimary}
                            onRemove={handleRemoveImage}
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                {/* Upload new images */}
                <div>
                    <p className="text-sm font-body text-[var(--muted)] mb-3">Add New Images</p>
                    <MultiImageUpload
                        onUpload={handleMultiImageUpload}
                        onError={(err: string) => setError(err)}
                        disabled={isSubmitting}
                        maxFiles={10}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Link
                    href={`/${locale}/admin`}
                    className="px-6 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                </button>
            </div>
        </form>
    );
}
