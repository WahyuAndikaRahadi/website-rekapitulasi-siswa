import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User | null;
    guru: GuruInfo | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru';
    email_verified_at: string | null;
    [key: string]: unknown;
}

export interface GuruInfo {
    id: number;
    nama: string;
    nip: string | null;
    is_wali_kelas: boolean;
    wali_kelas: {
        id: number;
        nama_kelas: string;
    } | null;
}
