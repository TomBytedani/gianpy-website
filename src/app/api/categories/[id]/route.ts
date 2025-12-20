import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
    params: Promise<{ id: string }>;
};

// GET /api/categories/[id] - Get a single category
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT /api/categories/[id] - Update a category (admin only)
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const body = await req.json();

        const { name, displayName, displayNameEn, description, sortOrder } = body;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check for name conflict (if name is being changed)
        if (name && name !== existingCategory.name) {
            const nameConflict = await prisma.category.findUnique({
                where: { name },
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: 'A category with this name already exists' },
                    { status: 400 }
                );
            }
        }

        // Update category
        const category = await prisma.category.update({
            where: { id },
            data: {
                name: name ?? existingCategory.name,
                displayName: displayName ?? existingCategory.displayName,
                displayNameEn: displayNameEn !== undefined ? displayNameEn || null : existingCategory.displayNameEn,
                description: description !== undefined ? description || null : existingCategory.description,
                sortOrder: sortOrder !== undefined ? sortOrder : existingCategory.sortOrder,
            },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Delete a category (admin only)
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await context.params;

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Block deletion if category has products assigned
        if (existingCategory._count.products > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete category with assigned products',
                    errorCode: 'HAS_PRODUCTS',
                    message: `Questa categoria ha ${existingCategory._count.products} prodotti assegnati. Rimuovi o riassegna i prodotti prima di eliminare la categoria.`,
                    productCount: existingCategory._count.products
                },
                { status: 400 }
            );
        }

        // Delete category
        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
