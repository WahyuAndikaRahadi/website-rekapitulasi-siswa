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

/**
 * Filosofi warna akumulasi poin murid:
 * -100: Dark Red (#991B1B)
 *  -75: Red (#DC2626)
 *  -50: Orange (#F97316)
 *  -25: Amber (#FBBF24)
 *    0: Gray (#9CA3AF)
 *  +25: Light Lime (#A3E635)
 *  +50: Green (#22C55E)
 *  +75: Teal (#0D9488)
 * +100: Dark Green (#166534)
 */
export function getAccumulatedPointColor(poin: number) {
    if (poin >= 100) {
        return {
            hex: '#166534',
            name: 'Dark Green',
            label: '+100',
            rowStyle: { backgroundColor: 'rgba(22, 101, 52, 0.14)' },
            badgeStyle: { backgroundColor: '#166534', color: '#FFFFFF', borderColor: '#14532D' },
            badgeClassName: 'bg-[#166534] text-white border-[#14532D]',
            borderAccent: '#166534',
        };
    }
    if (poin >= 75) {
        return {
            hex: '#0D9488',
            name: 'Teal',
            label: '+75',
            rowStyle: { backgroundColor: 'rgba(13, 148, 136, 0.14)' },
            badgeStyle: { backgroundColor: '#0D9488', color: '#FFFFFF', borderColor: '#0F766E' },
            badgeClassName: 'bg-[#0D9488] text-white border-[#0F766E]',
            borderAccent: '#0D9488',
        };
    }
    if (poin >= 50) {
        return {
            hex: '#22C55E',
            name: 'Green',
            label: '+50',
            rowStyle: { backgroundColor: 'rgba(34, 197, 94, 0.14)' },
            badgeStyle: { backgroundColor: '#22C55E', color: '#FFFFFF', borderColor: '#16A34A' },
            badgeClassName: 'bg-[#22C55E] text-white border-[#16A34A]',
            borderAccent: '#22C55E',
        };
    }
    if (poin >= 25) {
        return {
            hex: '#A3E635',
            name: 'Light Lime',
            label: '+25',
            rowStyle: { backgroundColor: 'rgba(163, 230, 53, 0.18)' },
            badgeStyle: { backgroundColor: '#A3E635', color: '#1E293B', borderColor: '#84CC16' },
            badgeClassName: 'bg-[#A3E635] text-slate-900 border-[#84CC16]',
            borderAccent: '#84CC16',
        };
    }
    if (poin > -25) {
        // Range mendekati 0 (antara -24 s/d +24)
        return {
            hex: '#9CA3AF',
            name: 'Gray',
            label: '0',
            rowStyle: { backgroundColor: 'rgba(156, 163, 175, 0.10)' },
            badgeStyle: { backgroundColor: '#9CA3AF', color: '#FFFFFF', borderColor: '#6B7280' },
            badgeClassName: 'bg-[#9CA3AF] text-white border-[#6B7280]',
            borderAccent: '#9CA3AF',
        };
    }
    if (poin > -50) {
        // Antara -25 s/d -49
        return {
            hex: '#FBBF24',
            name: 'Amber',
            label: '-25',
            rowStyle: { backgroundColor: 'rgba(251, 191, 36, 0.18)' },
            badgeStyle: { backgroundColor: '#FBBF24', color: '#1E293B', borderColor: '#F59E0B' },
            badgeClassName: 'bg-[#FBBF24] text-slate-900 border-[#F59E0B]',
            borderAccent: '#F59E0B',
        };
    }
    if (poin > -75) {
        // Antara -50 s/d -74
        return {
            hex: '#F97316',
            name: 'Orange',
            label: '-50',
            rowStyle: { backgroundColor: 'rgba(249, 115, 22, 0.15)' },
            badgeStyle: { backgroundColor: '#F97316', color: '#FFFFFF', borderColor: '#EA580C' },
            badgeClassName: 'bg-[#F97316] text-white border-[#EA580C]',
            borderAccent: '#EA580C',
        };
    }
    if (poin > -100) {
        // Antara -75 s/d -99
        return {
            hex: '#DC2626',
            name: 'Red',
            label: '-75',
            rowStyle: { backgroundColor: 'rgba(220, 38, 38, 0.15)' },
            badgeStyle: { backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#B91C1C' },
            badgeClassName: 'bg-[#DC2626] text-white border-[#B91C1C]',
            borderAccent: '#B91C1C',
        };
    }
    // <= -100
    return {
        hex: '#991B1B',
        name: 'Dark Red',
        label: '-100',
        rowStyle: { backgroundColor: 'rgba(153, 27, 27, 0.17)' },
        badgeStyle: { backgroundColor: '#991B1B', color: '#FFFFFF', borderColor: '#7F1D1D' },
        badgeClassName: 'bg-[#991B1B] text-white border-[#7F1D1D]',
        borderAccent: '#7F1D1D',
    };
}


/**
 * Format string tanggal (ISO atau Y-m-d) menjadi format Indonesia (cth: 21 September 2026)
 */
export function formatIndonesianDate(dateStr: string | null | undefined, includeDay: boolean = false): string {
    if (!dateStr) return '—';
    try {
        // Jika format Y-m-d murni (cth: "2026-09-20"), parsing tanpa timezone offset shift
        let date: Date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(dateStr);
        }

        if (isNaN(date.getTime())) return dateStr;

        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...(includeDay ? { weekday: 'long' } : {}),
            timeZone: 'Asia/Jakarta',
        }).format(date);
    } catch {
        return dateStr;
    }
}


