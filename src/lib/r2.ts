/**
 * Cloudflare R2 Storage Client
 * 
 * Cloudflare R2 is S3-compatible object storage.
 * This module provides a configured S3 client for uploading/managing images.
 */

import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    type PutObjectCommandInput,
    type DeleteObjectCommandInput
} from '@aws-sdk/client-s3';

// R2 Configuration from environment variables
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate required environment variables
function validateR2Config(): void {
    const missing: string[] = [];

    if (!R2_ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
    if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
    if (!R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
    if (!R2_BUCKET_NAME) missing.push('R2_BUCKET_NAME');

    if (missing.length > 0) {
        throw new Error(`Missing R2 configuration: ${missing.join(', ')}`);
    }
}

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
    region: 'auto', // R2 uses 'auto' region
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

// Export bucket name for use in commands
export const R2_BUCKET = R2_BUCKET_NAME || '';

/**
 * Get the public URL for an uploaded file
 * @param key - The object key (file path in bucket)
 * @returns The public URL to access the file
 */
export function getPublicUrl(key: string): string {
    if (!R2_PUBLIC_URL) {
        // Fallback: generate a placeholder URL if public access is not configured
        // In production, this should be the actual public URL
        console.warn('R2_PUBLIC_URL is not configured. Image URLs may not work correctly.');
        return `https://${R2_BUCKET_NAME}.r2.dev/${key}`;
    }

    // Remove trailing slash from public URL if present
    const baseUrl = R2_PUBLIC_URL.endsWith('/')
        ? R2_PUBLIC_URL.slice(0, -1)
        : R2_PUBLIC_URL;

    return `${baseUrl}/${key}`;
}

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate an image file before upload
 * @param file - The file to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateImageFile(
    contentType: string,
    size: number
): { isValid: boolean; error?: string } {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        return {
            isValid: false,
            error: `Invalid file type: ${contentType}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        };
    }

    // Check file size
    if (size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File too large: ${Math.round(size / 1024 / 1024)}MB. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
    }

    return { isValid: true };
}

/**
 * Generate a unique filename for an uploaded image
 * @param originalFilename - The original filename
 * @returns A unique filename with UUID prefix
 */
export function generateUniqueFilename(originalFilename: string): string {
    const uuid = crypto.randomUUID();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();

    return `products/${timestamp}-${uuid}.${extension}`;
}

/**
 * Upload a file to R2
 * @param key - The object key (path in bucket)
 * @param body - The file content as Buffer or stream
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
    key: string,
    body: Buffer | Uint8Array | ReadableStream,
    contentType: string
): Promise<string> {
    validateR2Config();

    const params: PutObjectCommandInput = {
        Bucket: R2_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        // Cache for 1 year (immutable content)
        CacheControl: 'public, max-age=31536000, immutable',
    };

    const command = new PutObjectCommand(params);
    await r2Client.send(command);

    return getPublicUrl(key);
}

/**
 * Delete a file from R2
 * @param key - The object key to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
    validateR2Config();

    const params: DeleteObjectCommandInput = {
        Bucket: R2_BUCKET,
        Key: key,
    };

    const command = new DeleteObjectCommand(params);
    await r2Client.send(command);
}

/**
 * Check if a file exists in R2
 * @param key - The object key to check
 * @returns True if the file exists, false otherwise
 */
export async function fileExistsInR2(key: string): Promise<boolean> {
    validateR2Config();

    try {
        const command = new HeadObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
        });
        await r2Client.send(command);
        return true;
    } catch {
        return false;
    }
}

/**
 * Extract the key from a public URL
 * @param url - The public URL
 * @returns The object key
 */
export function extractKeyFromUrl(url: string): string | null {
    if (!R2_PUBLIC_URL) return null;

    const baseUrl = R2_PUBLIC_URL.endsWith('/')
        ? R2_PUBLIC_URL.slice(0, -1)
        : R2_PUBLIC_URL;

    if (url.startsWith(baseUrl)) {
        return url.slice(baseUrl.length + 1); // +1 for the slash
    }

    // Try to extract from any R2 URL pattern
    const match = url.match(/r2\.dev\/(.+)$/) || url.match(/r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
}

// Export commands for direct use if needed
export { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand };
