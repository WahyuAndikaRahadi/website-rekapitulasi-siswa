import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getViolationPointBadgeInfo(poin: number) {
    if (poin >= 100) {
        return {
            bgHex: '#991B1B',
            textHex: '#FFFFFF',
            borderHex: '#7F1D1D',
            label: 'Tahap IV',
            hasViolation: true,
            style: { backgroundColor: '#991B1B', color: '#FFFFFF', borderColor: '#7F1D1D' },
            rowStyle: { backgroundColor: 'rgba(153, 27, 27, 0.15)' },
            rowClassName: 'bg-[#991B1B]/15 hover:bg-[#991B1B]/25',
            classNames: 'bg-[#991B1B] text-white border-[#7F1D1D]',
        };
    }
    if (poin >= 75) {
        return {
            bgHex: '#DC2626',
            textHex: '#FFFFFF',
            borderHex: '#B91C1C',
            label: 'Tahap III',
            hasViolation: true,
            style: { backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#B91C1C' },
            rowStyle: { backgroundColor: 'rgba(220, 38, 38, 0.15)' },
            rowClassName: 'bg-[#DC2626]/15 hover:bg-[#DC2626]/25',
            classNames: 'bg-[#DC2626] text-white border-[#B91C1C]',
        };
    }
    if (poin >= 50) {
        return {
            bgHex: '#F97316',
            textHex: '#FFFFFF',
            borderHex: '#C2410C',
            label: 'Tahap II',
            hasViolation: true,
            style: { backgroundColor: '#F97316', color: '#FFFFFF', borderColor: '#C2410C' },
            rowStyle: { backgroundColor: 'rgba(249, 115, 22, 0.15)' },
            rowClassName: 'bg-[#F97316]/15 hover:bg-[#F97316]/25',
            classNames: 'bg-[#F97316] text-white border-[#C2410C]',
        };
    }
    if (poin >= 25) {
        return {
            bgHex: '#FACC15',
            textHex: '#1E293B',
            borderHex: '#EAB308',
            label: 'Tahap I',
            hasViolation: true,
            style: { backgroundColor: '#FACC15', color: '#1E293B', borderColor: '#EAB308' },
            rowStyle: { backgroundColor: 'rgba(250, 204, 21, 0.25)' },
            rowClassName: 'bg-[#FACC15]/25 hover:bg-[#FACC15]/35',
            classNames: 'bg-[#FACC15] text-slate-900 border-[#EAB308]',
        };
    }
    return {
        bgHex: '#F1F5F9',
        textHex: '#475569',
        borderHex: '#E2E8F0',
        label: 'Normal',
        hasViolation: false,
        style: {},
        rowStyle: {},
        rowClassName: '',
        classNames: 'bg-slate-100 text-slate-600 border-slate-200',
    };
}

