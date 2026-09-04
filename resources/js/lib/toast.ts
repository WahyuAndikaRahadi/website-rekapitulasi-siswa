/**
 * Toast helper terpusat — wrapper di atas react-hot-toast
 * dengan styling brand SMKN 69 Jakarta.
 *
 * Import dari sini, bukan langsung dari 'react-hot-toast',
 * supaya styling konsisten di seluruh aplikasi.
 */
import * as React from 'react';
import toastLib from 'react-hot-toast';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const baseStyle: React.CSSProperties = {
    background: '#FFFFFF',
    color: '#0F172A',
    border: '1px solid #E2E8F0',
    borderRadius: '0.5rem',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 4px 12px -2px rgba(11,37,89,0.12)',
    maxWidth: '400px',
};

export const toast = {
    success: (message: string, options?: Parameters<typeof toastLib.success>[1]) =>
        toastLib.success(message, {
            duration: 4500,
            style: {
                ...baseStyle,
                borderLeft: '4px solid #2E8B57',
            },
            iconTheme: { primary: '#2E8B57', secondary: '#FFFFFF' },
            ...options,
        }),

    error: (message: string, options?: Parameters<typeof toastLib.error>[1]) =>
        toastLib.error(message, {
            duration: 7000,
            style: {
                ...baseStyle,
                borderLeft: '4px solid #D6293E',
            },
            iconTheme: { primary: '#D6293E', secondary: '#FFFFFF' },
            ...options,
        }),

    info: (message: string, options?: Parameters<typeof toastLib>[1]) =>
        toastLib(message, {
            duration: 5000,
            style: {
                ...baseStyle,
                borderLeft: '4px solid #1E5FA8',
            },
            icon: React.createElement(Info, { className: 'size-5 text-[#1E5FA8]' }),
            ...options,
        }),

    warning: (message: string, options?: Parameters<typeof toastLib>[1]) =>
        toastLib(message, {
            duration: 5500,
            style: {
                ...baseStyle,
                borderLeft: '4px solid #F5B700',
            },
            icon: React.createElement(AlertTriangle, { className: 'size-5 text-[#F5B700]' }),
            ...options,
        }),

    loading: (message: string, options?: Parameters<typeof toastLib.loading>[1]) =>
        toastLib.loading(message, {
            style: baseStyle,
            ...options,
        }),

    dismiss: toastLib.dismiss,
    promise: toastLib.promise,
};

export default toast;
