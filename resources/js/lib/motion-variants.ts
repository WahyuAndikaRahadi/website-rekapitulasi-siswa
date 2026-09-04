import { type Variants } from 'motion/react';

/**
 * Standard Motion Variants for SMKN 69 Jakarta Web App
 * Consistently applied across pages, tables, tabs, and modals.
 */

// 1. Page-level transition (quick and unobtrusive: 0.15s - 0.2s)
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 4,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.18,
            ease: [0.16, 1, 0.3, 1],
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.12,
            ease: 'easeOut',
        },
    },
};

// 2. Simple Fade In
export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.15, ease: 'easeIn' },
    },
};

// 3. Fade In Up (for cards, headers, form sections)
export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        y: -4,
        transition: { duration: 0.15, ease: 'easeIn' },
    },
};

// 4. Stagger container for lists and table rows
export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.02,
        },
    },
};

// 5. Individual table row / list item animation
export const staggerItem: Variants = {
    initial: { opacity: 0, y: 6 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
    },
};

// 6. Tab Content Transition
export const tabContentVariant: Variants = {
    initial: { opacity: 0, x: -6 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.18, ease: 'easeOut' },
    },
    exit: {
        opacity: 0,
        x: 6,
        transition: { duration: 0.12, ease: 'easeIn' },
    },
};
