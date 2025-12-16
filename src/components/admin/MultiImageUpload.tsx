'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone, type FileRejection } from 'react-dropzone';

type UploadedImage = {
    url: string;
    key: string;
    filename: string;
    size: number;
    contentType: string;
};

type UploadingFile = {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    result?: UploadedImage;
};

type MultiImageUploadProps = {
    onUpload: (images: UploadedImage[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    maxFiles?: number;
    className?: string;
};

// Get upload configuration
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
};

export default function MultiImageUpload({
    onUpload,
    onError,
    disabled = false,
    maxFiles = 10,
    className = '',
}: MultiImageUploadProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [completedUploads, setCompletedUploads] = useState<UploadedImage[]>([]);

    const validateFile = useCallback((file: File): string | null => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return `Invalid file type: .${extension}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
        }
        return null;
    }, []);

    const uploadFile = async (uploadingFile: UploadingFile): Promise<UploadedImage | null> => {
        const formData = new FormData();
        formData.append('file', uploadingFile.file);

        try {
            // Update status to uploading
            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadingFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f
                )
            );

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadingFiles((prev) =>
                    prev.map((f) =>
                        f.id === uploadingFile.id && f.status === 'uploading'
                            ? { ...f, progress: Math.min(f.progress + 15, 90) }
                            : f
                    )
                );
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

            // Update to success
            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'success' as const, progress: 100, result }
                        : f
                )
            );

            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';

            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'error' as const, error: errorMessage }
                        : f
                )
            );

            return null;
        }
    };

    const processFiles = async (files: File[]) => {
        // Create upload entries with previews
        const newFiles: UploadingFile[] = files.map((file) => ({
            id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: 'pending' as const,
        }));

        setUploadingFiles((prev) => [...prev, ...newFiles]);

        // Upload files sequentially to avoid overwhelming the server
        const results: UploadedImage[] = [];

        for (const uploadingFile of newFiles) {
            const result = await uploadFile(uploadingFile);
            if (result) {
                results.push(result);
            }
        }

        if (results.length > 0) {
            setCompletedUploads((prev) => [...prev, ...results]);
            onUpload(results);
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (disabled) return;

            // Handle rejected files
            if (fileRejections.length > 0) {
                const errors = fileRejections
                    .map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(', ')}`)
                    .join('; ');
                onError?.(errors);
            }

            // Validate and filter accepted files
            const validFiles: File[] = [];
            const errors: string[] = [];

            for (const file of acceptedFiles) {
                const error = validateFile(file);
                if (error) {
                    errors.push(`${file.name}: ${error}`);
                } else {
                    validFiles.push(file);
                }
            }

            if (errors.length > 0) {
                onError?.(errors.join('; '));
            }

            if (validFiles.length > 0) {
                processFiles(validFiles);
            }
        },
        [disabled, validateFile, onError]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        maxSize: MAX_FILE_SIZE,
        maxFiles,
        disabled,
        multiple: true,
    });

    const removeUploadingFile = (id: string) => {
        setUploadingFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file) {
                URL.revokeObjectURL(file.preview);
            }
            return prev.filter((f) => f.id !== id);
        });
    };

    const retryUpload = async (id: string) => {
        const file = uploadingFiles.find((f) => f.id === id);
        if (file) {
            setUploadingFiles((prev) =>
                prev.map((f) =>
                    f.id === id ? { ...f, status: 'pending' as const, progress: 0, error: undefined } : f
                )
            );
            const result = await uploadFile(file);
            if (result) {
                setCompletedUploads((prev) => [...prev, result]);
                onUpload([result]);
            }
        }
    };

    const clearCompleted = () => {
        setUploadingFiles((prev) => {
            prev.filter((f) => f.status === 'success').forEach((f) => URL.revokeObjectURL(f.preview));
            return prev.filter((f) => f.status !== 'success');
        });
    };

    const hasUploads = uploadingFiles.length > 0;
    const hasErrors = uploadingFiles.some((f) => f.status === 'error');
    const hasCompleted = uploadingFiles.some((f) => f.status === 'success');
    const isUploading = uploadingFiles.some((f) => f.status === 'uploading' || f.status === 'pending');

    return (
        <div className={className}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center gap-4
          cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.02]' : 'border-[var(--border)]'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive ? 'hover:border-[var(--primary)] hover:bg-[var(--surface)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />

                {/* Upload icon */}
                <div className={`
          w-16 h-16 rounded-full flex items-center justify-center transition-colors
          ${isDragActive ? 'bg-[var(--primary)]/10' : 'bg-[var(--surface)]'}
        `}>
                    <svg
                        className={`w-8 h-8 transition-colors ${isDragActive ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="text-center">
                    {isDragActive && !isDragReject ? (
                        <p className="font-body text-[var(--primary)] font-medium">Drop images here...</p>
                    ) : isDragReject ? (
                        <p className="font-body text-red-600 font-medium">Some files are not allowed</p>
                    ) : (
                        <>
                            <p className="font-body text-[var(--foreground)]">
                                <span className="text-[var(--primary)] font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-[var(--muted)] mt-1">
                                {ALLOWED_EXTENSIONS.map((e) => e.toUpperCase()).join(', ')} up to {MAX_FILE_SIZE_MB}MB each
                            </p>
                            <p className="text-xs text-[var(--muted)] mt-1">
                                You can select multiple files at once
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Queue */}
            {hasUploads && (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-body text-[var(--muted)]">
                            {isUploading ? 'Uploading...' : hasErrors ? 'Some uploads failed' : 'Upload complete'}
                        </p>
                        {hasCompleted && !isUploading && (
                            <button
                                type="button"
                                onClick={clearCompleted}
                                className="text-xs text-[var(--primary)] hover:underline"
                            >
                                Clear completed
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {uploadingFiles.map((file) => (
                            <div
                                key={file.id}
                                className={`
                  relative rounded-lg overflow-hidden bg-[var(--background)] border
                  ${file.status === 'success' ? 'border-green-400' : ''}
                  ${file.status === 'error' ? 'border-red-400' : ''}
                  ${file.status === 'uploading' || file.status === 'pending' ? 'border-[var(--border)]' : ''}
                `}
                            >
                                {/* Preview image */}
                                <div className="relative aspect-square">
                                    <Image
                                        src={file.preview}
                                        alt={file.file.name}
                                        fill
                                        className="object-cover"
                                    />

                                    {/* Progress overlay */}
                                    {(file.status === 'uploading' || file.status === 'pending') && (
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                            <div className="w-3/4 bg-white/30 rounded-full h-1.5">
                                                <div
                                                    className="bg-white h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${file.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-white text-xs mt-1">{file.progress}%</span>
                                        </div>
                                    )}

                                    {/* Success overlay */}
                                    {file.status === 'success' && (
                                        <div className="absolute top-1 right-1">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error overlay */}
                                    {file.status === 'error' && (
                                        <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center p-2">
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-white text-xs text-center mt-1 line-clamp-2">{file.error}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-1.5 flex items-center justify-between bg-[var(--surface)]">
                                    <span className="text-xs text-[var(--muted)] truncate flex-1 mr-1">
                                        {file.file.name.length > 15 ? file.file.name.substring(0, 12) + '...' : file.file.name}
                                    </span>
                                    <div className="flex gap-1">
                                        {file.status === 'error' && (
                                            <button
                                                type="button"
                                                onClick={() => retryUpload(file.id)}
                                                className="p-1 hover:bg-[var(--background)] rounded"
                                                title="Retry"
                                            >
                                                <svg className="w-3.5 h-3.5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeUploadingFile(file.id)}
                                            className="p-1 hover:bg-[var(--background)] rounded"
                                            title="Remove"
                                        >
                                            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
