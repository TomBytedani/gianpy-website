import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Fetch current site settings (public, cached)
export async function GET() {
    try {
        // Get or create the singleton settings row
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'default' },
        });

        // If no settings exist, create default settings
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: 'default' },
            });
        }

        // Convert Decimal fields to numbers for JSON response
        const response = {
            ...settings,
            freeShippingThreshold: Number(settings.freeShippingThreshold),
            domesticShippingCost: Number(settings.domesticShippingCost),
            internationalShippingCost: Number(settings.internationalShippingCost),
        };

        return NextResponse.json(response, {
            headers: {
                // Cache for 5 minutes, stale-while-revalidate for 1 hour
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
            },
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT /api/settings - Update site settings (admin only)
export async function PUT(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Extract and validate fields
        const {
            // Business Info
            businessName,
            businessNameEn,
            tagline,
            taglineEn,
            openingHours,
            openingHoursEn,
            // Contact Info
            email,
            phone,
            address,
            city,
            postalCode,
            country,
            // Social Media
            facebookUrl,
            instagramUrl,
            whatsappUrl,
            // Shipping
            freeShippingThreshold,
            domesticShippingCost,
            internationalShippingCost,
            shippingNotes,
            shippingNotesEn,
            // Email Settings
            orderConfirmationEnabled,
            wishlistNotificationsEnabled,
            contactFormNotificationEmail,
        } = body;

        // Build update data object (only include provided fields)
        const updateData: Record<string, unknown> = {};

        // Business Info
        if (businessName !== undefined) updateData.businessName = businessName;
        if (businessNameEn !== undefined) updateData.businessNameEn = businessNameEn;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (taglineEn !== undefined) updateData.taglineEn = taglineEn;
        if (openingHours !== undefined) updateData.openingHours = openingHours;
        if (openingHoursEn !== undefined) updateData.openingHoursEn = openingHoursEn;

        // Contact Info
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (postalCode !== undefined) updateData.postalCode = postalCode;
        if (country !== undefined) updateData.country = country;

        // Social Media
        if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl || null;
        if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl || null;
        if (whatsappUrl !== undefined) updateData.whatsappUrl = whatsappUrl || null;

        // Shipping
        if (freeShippingThreshold !== undefined) updateData.freeShippingThreshold = freeShippingThreshold;
        if (domesticShippingCost !== undefined) updateData.domesticShippingCost = domesticShippingCost;
        if (internationalShippingCost !== undefined) updateData.internationalShippingCost = internationalShippingCost;
        if (shippingNotes !== undefined) updateData.shippingNotes = shippingNotes || null;
        if (shippingNotesEn !== undefined) updateData.shippingNotesEn = shippingNotesEn || null;

        // Email Settings
        if (orderConfirmationEnabled !== undefined) updateData.orderConfirmationEnabled = orderConfirmationEnabled;
        if (wishlistNotificationsEnabled !== undefined) updateData.wishlistNotificationsEnabled = wishlistNotificationsEnabled;
        if (contactFormNotificationEmail !== undefined) updateData.contactFormNotificationEmail = contactFormNotificationEmail;

        // Upsert: update if exists, create if not
        const settings = await prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: updateData,
            create: {
                id: 'default',
                ...updateData,
            },
        });

        // Convert Decimal fields to numbers for JSON response
        const response = {
            ...settings,
            freeShippingThreshold: Number(settings.freeShippingThreshold),
            domesticShippingCost: Number(settings.domesticShippingCost),
            internationalShippingCost: Number(settings.internationalShippingCost),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
