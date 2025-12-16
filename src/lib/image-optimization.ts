/**
 * Server-side Image Optimization with Sharp
 *
 * Handles image resizing, format conversion, and compression
 * before uploading to R2 storage.
 */

import sharp from 'sharp';

// Optimization presets
export const IMAGE_PRESETS = {
    // Full size image for product detail pages
    full: {
        maxWidth: 2000,
        maxHeight: 2000,
        quality: 85,
        format: 'webp' as const,
    },
    // Thumbnail for listings and grids
    thumbnail: {
        maxWidth: 400,
        maxHeight: 400,
        quality: 80,
        format: 'webp' as const,
    },
    // Medium size for cards and previews
    medium: {
        maxWidth: 800,
        maxHeight: 800,
        quality: 82,
        format: 'webp' as const,
    },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

export interface OptimizedImage {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
    size: number;
    key: string;
}

export interface OptimizationResult {
    original: OptimizedImage;
    thumbnail?: OptimizedImage;
    medium?: OptimizedImage;
}

/**
 * Optimize a single image with a specific preset
 */
export async function optimizeImage(
    inputBuffer: Buffer,
    preset: ImagePreset = 'full',
    originalFilename: string
): Promise<OptimizedImage> {
    const config = IMAGE_PRESETS[preset];

    // Process with sharp
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    // Only resize if image is larger than max dimensions
    let width = metadata.width || 0;
    let height = metadata.height || 0;

    if (width > config.maxWidth || height > config.maxHeight) {
        image.resize(config.maxWidth, config.maxHeight, {
            fit: 'inside', // Maintain aspect ratio, fit within bounds
            withoutEnlargement: true,
        });
    }

    // Convert to WebP with quality settings
    const processedBuffer = await image
        .webp({ quality: config.quality, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    // Generate key with preset suffix
    const baseName = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension
    const timestamp = Date.now();
    const uuid = crypto.randomUUID().slice(0, 8);
    const key =
        preset === 'full'
            ? `products/${timestamp}-${uuid}.webp`
            : `products/${timestamp}-${uuid}-${preset}.webp`;

    return {
        buffer: processedBuffer.data,
        width: processedBuffer.info.width,
        height: processedBuffer.info.height,
        format: 'webp',
        size: processedBuffer.data.length,
        key,
    };
}

/**
 * Process an image and generate all required sizes
 */
export async function processImageWithVariants(
    inputBuffer: Buffer,
    originalFilename: string,
    generateVariants: boolean = false
): Promise<OptimizationResult> {
    // Always generate the full-size optimized image
    const original = await optimizeImage(inputBuffer, 'full', originalFilename);

    const result: OptimizationResult = { original };

    // Optionally generate thumbnail and medium variants
    if (generateVariants) {
        // Use the same base for variants
        const baseKey = original.key.replace('.webp', '');

        const [thumbnail, medium] = await Promise.all([
            optimizeImage(inputBuffer, 'thumbnail', originalFilename),
            optimizeImage(inputBuffer, 'medium', originalFilename),
        ]);

        // Update keys to match the original's prefix pattern
        thumbnail.key = baseKey + '-thumb.webp';
        medium.key = baseKey + '-medium.webp';

        result.thumbnail = thumbnail;
        result.medium = medium;
    }

    return result;
}

/**
 * Get content type for optimized images
 */
export function getOptimizedContentType(): string {
    return 'image/webp';
}

/**
 * Check if an image should be optimized based on its type
 */
export function shouldOptimize(contentType: string): boolean {
    const optimizableTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
    ];
    return optimizableTypes.includes(contentType.toLowerCase());
}

/**
 * Get image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
}> {
    const metadata = await sharp(buffer).metadata();
    return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: buffer.length,
    };
}

/**
 * Estimate compression savings
 */
export function calculateSavings(originalSize: number, optimizedSize: number): {
    savedBytes: number;
    savedPercent: number;
} {
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = Math.round((savedBytes / originalSize) * 100);
    return { savedBytes, savedPercent };
}
