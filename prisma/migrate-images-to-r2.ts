/**
 * Migration Script: Update Product Images to R2 URLs
 * 
 * This script updates all existing product images in the database
 * from local /images/ paths to Cloudflare R2 public URLs.
 * 
 * Run with: npx tsx prisma/migrate-images-to-r2.ts
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-c08ae0de86f94e598029df0900cc46b3.r2.dev';

// Mapping of local paths to R2 paths
const IMAGE_MAPPING: Record<string, string> = {
    '/images/product1.png': `${R2_PUBLIC_URL}/product1.png`,
    '/images/product2-specchiera.png': `${R2_PUBLIC_URL}/product2-specchiera.png`,
    '/images/product3-tavolo.png': `${R2_PUBLIC_URL}/product3-tavolo.png`,
    '/images/product4-poltrona.png': `${R2_PUBLIC_URL}/product4-poltrona.png`,
    '/images/product5-credenza.png': `${R2_PUBLIC_URL}/product5-credenza.png`,
    '/images/product6-scrittoio.png': `${R2_PUBLIC_URL}/product6-scrittoio.png`,
    '/images/hero-image.jpg': `${R2_PUBLIC_URL}/hero-image.jpg`,
};

async function main() {
    console.log('🔄 Starting image URL migration to R2...');
    console.log(`📷 R2 URL: ${R2_PUBLIC_URL}`);

    // Get all product images
    const images = await prisma.productImage.findMany();
    console.log(`📊 Found ${images.length} product images in database`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const image of images) {
        // Check if URL is a local path
        if (image.url.startsWith('/images/')) {
            const newUrl = IMAGE_MAPPING[image.url];

            if (newUrl) {
                await prisma.productImage.update({
                    where: { id: image.id },
                    data: { url: newUrl },
                });
                console.log(`  ✓ Updated: ${image.url} -> ${newUrl}`);
                updatedCount++;
            } else {
                // If no mapping exists, try to construct the URL from the filename
                const filename = image.url.replace('/images/', '');
                const constructedUrl = `${R2_PUBLIC_URL}/${filename}`;

                await prisma.productImage.update({
                    where: { id: image.id },
                    data: { url: constructedUrl },
                });
                console.log(`  ✓ Updated (auto): ${image.url} -> ${constructedUrl}`);
                updatedCount++;
            }
        } else if (image.url.startsWith('http')) {
            console.log(`  ⏭ Skipped (already external): ${image.url.substring(0, 50)}...`);
            skippedCount++;
        } else {
            console.log(`  ⚠ Unknown format: ${image.url}`);
            skippedCount++;
        }
    }

    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`  ✓ Updated: ${updatedCount} images`);
    console.log(`  ⏭ Skipped: ${skippedCount} images`);
    console.log('');
    console.log('✅ Image URL migration completed!');
}

main()
    .catch((e) => {
        console.error('❌ Migration error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
