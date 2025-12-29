'use client';

import React from 'react';

interface BaroquePatternProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'all';
    opacity?: number;
    className?: string;
}

/**
 * Subtle baroque decorative flourish pattern component.
 * Adds elegant rococo scrollwork at corners without competing with content.
 * Use opacity between 0.05-0.10 for subtle effect.
 */
export function BaroquePattern({
    position = 'all',
    opacity = 0.06,
    className = '',
}: BaroquePatternProps) {
    // Elegant rococo scrollwork SVG path
    const flourishPath = `
    M50,10 Q30,25 15,20 Q5,18 2,30 Q0,45 10,50 Q25,55 20,70 Q18,80 30,85 Q45,90 50,75
    M50,10 Q70,25 85,20 Q95,18 98,30 Q100,45 90,50 Q75,55 80,70 Q82,80 70,85 Q55,90 50,75
    M50,75 Q40,82 35,90 Q30,95 35,98 Q42,100 50,95 Q58,100 65,98 Q70,95 65,90 Q60,82 50,75
  `;

    const FlourishSVG = ({ style, flipped = false }: { style: React.CSSProperties; flipped?: boolean }) => (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute"
            style={{
                width: '180px',
                height: '180px',
                opacity,
                transform: flipped ? 'scale(-1, 1)' : 'none',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                ...style,
            }}
            aria-hidden="true"
            shapeRendering="geometricPrecision"
        >
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="50%" stopColor="var(--primary-dark)" />
                    <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
            </defs>
            {/* Main scrollwork */}
            <path
                d={flourishPath}
                fill="none"
                stroke="url(#goldGradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Center flourish dot */}
            <circle cx="50" cy="50" r="3" fill="var(--primary)" opacity="0.5" />
            {/* Decorative curls */}
            <path
                d="M20,40 Q15,35 18,28 M80,40 Q85,35 82,28"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.4"
            />
            {/* Additional scrollwork details */}
            <path
                d="M30,60 Q25,65 28,75 M70,60 Q75,65 72,75"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.3"
            />
        </svg>
    );

    const showTopLeft = position === 'all' || position === 'top-left';
    const showTopRight = position === 'all' || position === 'top-right';
    const showBottomLeft = position === 'all' || position === 'bottom-left';
    const showBottomRight = position === 'all' || position === 'bottom-right';

    return (
        <div
            className={`baroque-pattern-container pointer-events-none absolute inset-0 overflow-hidden ${className}`}
            aria-hidden="true"
            style={{
                isolation: 'isolate',
                zIndex: 0,
                contain: 'strict',
                clipPath: 'inset(0)',
            }}
        >
            {/* Top Left Flourish */}
            {showTopLeft && (
                <FlourishSVG style={{ top: '0px', left: '0px' }} />
            )}

            {/* Top Right Flourish (mirrored) */}
            {showTopRight && (
                <FlourishSVG style={{ top: '0px', right: '0px' }} flipped />
            )}

            {/* Bottom Left Flourish (rotated) */}
            {/* Note: Using 2px inset to prevent sub-pixel rendering artifacts at section boundaries */}
            {showBottomLeft && (
                <FlourishSVG
                    style={{
                        bottom: '2px',
                        left: '0px',
                        transform: 'rotate(180deg)',
                    }}
                />
            )}

            {/* Bottom Right Flourish (rotated and mirrored) */}
            {/* Note: Using 2px inset to prevent sub-pixel rendering artifacts at section boundaries */}
            {showBottomRight && (
                <FlourishSVG
                    style={{
                        bottom: '2px',
                        right: '0px',
                        transform: 'scale(-1, 1) rotate(180deg)',
                    }}
                    flipped
                />
            )}
        </div>
    );
}

/**
 * Simple divider flourish - a horizontal decorative line with scrollwork
 */
export function BaroqueDivider({
    className = '',
    opacity = 0.15,
}: {
    className?: string;
    opacity?: number;
}) {
    return (
        <div className={`flex items-center justify-center my-8 ${className}`}>
            <svg
                viewBox="0 0 200 24"
                className="w-48 h-6"
                style={{ opacity }}
                aria-hidden="true"
            >
                <defs>
                    <linearGradient id="dividerGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                        <stop offset="30%" stopColor="var(--primary)" stopOpacity="1" />
                        <stop offset="50%" stopColor="var(--primary)" stopOpacity="1" />
                        <stop offset="70%" stopColor="var(--primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Center line */}
                <line
                    x1="20" y1="12" x2="180" y2="12"
                    stroke="url(#dividerGradient)"
                    strokeWidth="1"
                />
                {/* Left flourish */}
                <path
                    d="M60,12 Q50,6 40,12 Q30,18 20,12"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
                {/* Right flourish */}
                <path
                    d="M140,12 Q150,6 160,12 Q170,18 180,12"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    strokeLinecap="round"
                />
                {/* Center diamond */}
                <polygon
                    points="100,6 106,12 100,18 94,12"
                    fill="var(--primary)"
                    opacity="0.5"
                />
                {/* Small decorative circles */}
                <circle cx="75" cy="12" r="2" fill="var(--primary)" opacity="0.3" />
                <circle cx="125" cy="12" r="2" fill="var(--primary)" opacity="0.3" />
            </svg>
        </div>
    );
}

export default BaroquePattern;
