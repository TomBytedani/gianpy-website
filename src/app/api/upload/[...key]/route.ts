import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteFromR2, extractKeyFromUrl } from '@/lib/r2';

interface RouteParams {
    params: Promise<{ key: string[] }>;
}

/**
 * DELETE /api/upload/[...key]
 * Delete an image from Cloudflare R2
 * 
 * The key is the full path after /api/upload/
 * Example: DELETE /api/upload/products/1234-uuid.jpg
 * 
 * Admin only endpoint
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        // Check authentication - only admins can delete
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const keyParts = resolvedParams.key;

        if (!keyParts || keyParts.length === 0) {
            return NextResponse.json(
                { error: 'No key provided. Please specify the file key to delete.' },
                { status: 400 }
            );
        }

        // Reconstruct the full key from path segments
        const key = keyParts.join('/');

        // Delete from R2
        await deleteFromR2(key);

        return NextResponse.json({
            success: true,
            message: `File "${key}" deleted successfully.`,
            key,
        });
    } catch (error) {
        console.error('Error deleting file:', error);

        // Check for specific R2 configuration errors
        if (error instanceof Error && error.message.includes('Missing R2 configuration')) {
            return NextResponse.json(
                { error: 'Image storage not configured. Please check R2 settings.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to delete file. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/upload/[...key] - Delete by URL
 * Alternative delete method that accepts the full URL in the request body
 * Useful when you have the public URL but not the key
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication - only admins can delete
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'No URL provided. Please include the image URL to delete.' },
                { status: 400 }
            );
        }

        // Extract key from URL
        const key = extractKeyFromUrl(url);

        if (!key) {
            return NextResponse.json(
                { error: 'Could not extract file key from URL. Please provide a valid R2 image URL.' },
                { status: 400 }
            );
        }

        // Delete from R2
        await deleteFromR2(key);

        return NextResponse.json({
            success: true,
            message: `File deleted successfully.`,
            key,
        });
    } catch (error) {
        console.error('Error deleting file by URL:', error);

        return NextResponse.json(
            { error: 'Failed to delete file. Please try again.' },
            { status: 500 }
        );
    }
}
