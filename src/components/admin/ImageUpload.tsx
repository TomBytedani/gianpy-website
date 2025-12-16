'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

type UploadedImage = {
    url: string;
    key: string;
    filename: string;
    size: number;
    contentType: string;
};

type ImageUploadProps = {
    onUpload: (image: UploadedImage) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
};

type UploadState = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

// Get upload configuration
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ImageUpload({
    onUpload,
    onError,
    disabled = false,
    className = ''
}: ImageUploadProps) {
    const [state, setState] = useState<UploadState>('idle');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = useCallback((file: File): string | null => {
        // Check file extension
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return `Invalid file type: .${extension}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: ${MAX_FILE_SIZE_MB}MB`;
        }

        return null;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setState('error');
            onError?.(validationError);
            return;
        }

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setSelectedFile(file);
        setError(null);
        setState('selected');
    }, [validateFile, onError]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setState('uploading');
        setUploadProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate progress (since fetch doesn't support progress for FormData)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const result = await response.json();
            setUploadProgress(100);
            setState('success');

            const uploadedImageData: UploadedImage = {
                url: result.url,
                key: result.key,
                filename: result.filename,
                size: result.size,
                contentType: result.contentType,
            };

            setUploadedImage(uploadedImageData);
            onUpload(uploadedImageData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
            setError(errorMessage);
            setState('error');
            onError?.(errorMessage);
        }
    };

    const handleReset = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        setError(null);
        setUploadedImage(null);
        setState('idle');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`${className}`}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                onChange={handleInputChange}
                disabled={disabled || state === 'uploading'}
                className="hidden"
            />

            {/* Upload area */}
            {state === 'idle' && (
                <div
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={`
            border-2 border-dashed border-[var(--border)] rounded-xl p-8
            flex flex-col items-center justify-center gap-4
            cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--surface)]
            transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {/* Upload icon */}
                    <div className="w-16 h-16 rounded-full bg-[var(--surface)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <div className="text-center">
                        <p className="font-body text-[var(--foreground)]">
                            <span className="text-[var(--primary)] font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            {ALLOWED_EXTENSIONS.map(e => e.toUpperCase()).join(', ')} up to {MAX_FILE_SIZE_MB}MB
                        </p>
                    </div>
                </div>
            )}

            {/* Preview state */}
            {(state === 'selected' || state === 'uploading') && previewUrl && (
                <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)]">
                    <div className="flex gap-4">
                        {/* Image preview */}
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* File info and actions */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <p className="font-body text-[var(--foreground)] truncate">
                                    {selectedFile?.name}
                                </p>
                                <p className="text-sm text-[var(--muted)]">
                                    {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                                </p>
                            </div>

                            {/* Progress bar */}
                            {state === 'uploading' && (
                                <div className="w-full bg-[var(--background)] rounded-full h-2 mt-2">
                                    <div
                                        className="bg-[var(--primary)] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 mt-3">
                                {state === 'selected' && (
                                    <>
                                        <button
                                            onClick={handleUpload}
                                            className="px-4 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                                        >
                                            Upload
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-4 py-1.5 border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm hover:bg-[var(--background)] transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                                {state === 'uploading' && (
                                    <span className="text-sm text-[var(--muted)]">Uploading... {uploadProgress}%</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success state */}
            {state === 'success' && uploadedImage && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                    <div className="flex gap-4">
                        {/* Image preview */}
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-[var(--background)] flex-shrink-0">
                            <Image
                                src={previewUrl || uploadedImage.url}
                                alt="Uploaded"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Success info */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-body text-green-800">Upload successful!</span>
                                </div>
                                <p className="text-sm text-green-700 mt-1 truncate">
                                    {uploadedImage.filename}
                                </p>
                            </div>

                            <button
                                onClick={handleReset}
                                className="self-start mt-3 px-4 py-1.5 border border-[var(--border)] text-[var(--foreground)] rounded-lg text-sm hover:bg-[var(--background)] transition-colors"
                            >
                                Upload another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error state */}
            {state === 'error' && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-body text-red-800">Upload failed</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={handleReset}
                                className="mt-3 px-4 py-1.5 border border-red-300 text-red-800 rounded-lg text-sm hover:bg-red-100 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
