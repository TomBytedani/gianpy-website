import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
    uploadToR2,
    validateImageFile,
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE
} from '@/lib/r2';
import {
    processImageWithVariants,
    shouldOptimize,
    getOptimizedContentType,
    calculateSavings,
} from '@/lib/image-optimization';

/**
 * POST /api/upload
 * Upload a single image to Cloudflare R2 with optimization
 * 
 * Request: multipart/form-data with 'file' field
 * Response: { url: string, key: string, optimized: boolean }
 * 
 * Admin only endpoint
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication - only admins can upload
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        // Parse multipart form data
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const optimize = formData.get('optimize') !== 'false'; // Default to true

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided. Please include a file in the "file" field.' },
                { status: 400 }
            );
        }

        // Validate file type and size
        const validation = validateImageFile(file.type, file.size);
        if (!validation.isValid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalSize = buffer.length;

        let finalBuffer: Buffer;
        let finalKey: string;
        let finalContentType: string;
        let optimized = false;
        let savings = { savedBytes: 0, savedPercent: 0 };

        // Optimize image if supported and enabled
        if (optimize && shouldOptimize(file.type)) {
            try {
                const result = await processImageWithVariants(buffer, file.name, false);

                finalBuffer = result.original.buffer;
                finalKey = result.original.key;
                finalContentType = getOptimizedContentType();
                optimized = true;
                savings = calculateSavings(originalSize, result.original.size);

                console.log(
                    `Image optimized: ${file.name} - ${Math.round(originalSize / 1024)}KB → ${Math.round(result.original.size / 1024)}KB (${savings.savedPercent}% smaller)`
                );
            } catch (optimizeError) {
                console.error('Image optimization failed, uploading original:', optimizeError);
                // Fall back to original if optimization fails
                finalBuffer = buffer;
                finalKey = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${file.name.split('.').pop()}`;
                finalContentType = file.type;
            }
        } else {
            // Upload original without optimization
            finalBuffer = buffer;
            finalKey = `products/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${file.name.split('.').pop()}`;
            finalContentType = file.type;
        }

        // Upload to R2
        const url = await uploadToR2(finalKey, finalBuffer, finalContentType);

        return NextResponse.json({
            success: true,
            url,
            key: finalKey,
            filename: file.name,
            size: finalBuffer.length,
            originalSize,
            contentType: finalContentType,
            optimized,
            savings: optimized ? savings : undefined,
        });
    } catch (error) {
        console.error('Error uploading file:', error);

        // Check for specific R2 configuration errors
        if (error instanceof Error && error.message.includes('Missing R2 configuration')) {
            return NextResponse.json(
                { error: 'Image upload not configured. Please check R2 settings.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to upload file. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/upload
 * Get upload configuration info (for client-side validation)
 */
export async function GET() {
    return NextResponse.json({
        maxFileSize: MAX_FILE_SIZE,
        maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    });
}
