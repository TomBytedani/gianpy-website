import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/categories - List all categories (public)
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create a new category (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, displayName, displayNameEn, description, sortOrder } = body;

        if (!name || !displayName) {
            return NextResponse.json(
                { error: 'Missing required fields: name, displayName' },
                { status: 400 }
            );
        }

        // Check for duplicate name
        const existing = await prisma.category.findUnique({
            where: { name },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A category with this name already exists' },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name,
                displayName,
                displayNameEn: displayNameEn || null,
                description: description || null,
                sortOrder: sortOrder || 0,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
