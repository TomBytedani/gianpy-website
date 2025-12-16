'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type ImageItem = {
    id: string;
    url: string;
    alt?: string | null;
    isPrimary: boolean;
    isNew?: boolean;
};

type SortableImageGridProps = {
    images: ImageItem[];
    onReorder: (images: ImageItem[]) => void;
    onSetPrimary: (id: string) => void;
    onRemove: (id: string) => void;
    disabled?: boolean;
};

type SortableImageProps = {
    image: ImageItem;
    onSetPrimary: (id: string) => void;
    onRemove: (id: string) => void;
    disabled?: boolean;
};

function SortableImage({ image, onSetPrimary, onRemove, disabled }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative group rounded-lg overflow-hidden
                ${isDragging ? 'ring-2 ring-[var(--primary)] shadow-lg' : ''}
                ${image.isNew ? 'border-2 border-dashed border-green-400' : 'border border-[var(--border)]'}
            `}
        >
            {/* Image area - this is the draggable zone */}
            <div
                {...attributes}
                {...listeners}
                className={`
                    relative aspect-square bg-[var(--background)] cursor-grab active:cursor-grabbing
                    ${disabled ? 'cursor-not-allowed' : ''}
                `}
            >
                <Image
                    src={image.url}
                    alt={image.alt || 'Product image'}
                    fill
                    className="object-cover pointer-events-none"
                    draggable={false}
                />

                {/* Primary badge */}
                {image.isPrimary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--primary)] text-white text-xs rounded font-medium shadow-sm pointer-events-none">
                        Primary
                    </div>
                )}

                {/* New badge */}
                {image.isNew && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded font-medium shadow-sm pointer-events-none">
                        New
                    </div>
                )}

                {/* Drag indicator */}
                <div className={`
                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none
                    ${disabled ? 'hidden' : ''}
                `}>
                    <div className="bg-black/60 rounded-lg px-3 py-2 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <span className="text-white text-xs font-medium">Drag</span>
                    </div>
                </div>
            </div>

            {/* Actions bar - outside of drag zone, fully clickable */}
            <div className="relative z-20 bg-[var(--surface)] p-2 flex items-center justify-center gap-2 border-t border-[var(--border)]">
                {!image.isPrimary && (
                    <button
                        type="button"
                        onClick={() => onSetPrimary(image.id)}
                        className="p-1.5 rounded hover:bg-[var(--background)] transition-colors flex items-center gap-1 cursor-pointer"
                        title="Set as primary"
                        disabled={disabled}
                    >
                        <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-[var(--foreground)]">Primary</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onRemove(image.id)}
                    className="p-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Remove image"
                    disabled={disabled}
                >
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="text-xs text-red-600">Remove</span>
                </button>
            </div>
        </div>
    );
}

export default function SortableImageGrid({
    images,
    onReorder,
    onSetPrimary,
    onRemove,
    disabled = false,
}: SortableImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.findIndex((img) => img.id === active.id);
            const newIndex = images.findIndex((img) => img.id === over.id);

            const reorderedImages = arrayMove(images, oldIndex, newIndex);
            onReorder(reorderedImages);
        }
    };

    if (images.length === 0) {
        return (
            <div className="text-center py-8 text-[var(--muted)]">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No images yet</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={images.map((img) => img.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                        <SortableImage
                            key={image.id}
                            image={image}
                            onSetPrimary={onSetPrimary}
                            onRemove={onRemove}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Reorder hint */}
            {images.length > 1 && !disabled && (
                <p className="text-xs text-[var(--muted)] mt-3 text-center">
                    💡 Drag images to reorder. The first image is used as the product thumbnail.
                </p>
            )}
        </DndContext>
    );
}
