import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, File, FileText, GraduationCap, LayoutDashboard, Mail, School, Settings, Users } from 'lucide-react';

// Nav items untuk role Admin
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Laporan Masuk',
        url: '/admin/laporan',
        icon: ClipboardList,
    },
    {
        title: 'Surat Panggilan',
        url: '/admin/surat-panggilan',
        icon: Mail,
    },
    {
        title: 'Ekspor Data',
        url: '/admin/export',
        icon: File,
    },
    {
        title: 'Kelola Murid',
        url: '/admin/murid',
        icon: GraduationCap,
    },
    {
        title: 'Kelola Guru',
        url: '/admin/guru',
        icon: Users,
    },
    {
        title: 'Kelola Kelas',
        url: '/admin/kelas',
        icon: School,
    },
];

// Nav items untuk role Guru (base — selalu ada)
const guruNavItemsBase: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/guru/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Buat Laporan',
        url: '/guru/laporan/buat',
        icon: ClipboardList,
    },
    {
        title: 'Riwayat Laporan',
        url: '/guru/laporan/riwayat',
        icon: BookOpen,
    },
];

// Item tambahan khusus wali kelas
const waliKelasNavItem: NavItem = {
    title: 'Rekap Kelas',
    url: '/guru/kelas/rekap',
    icon: GraduationCap,
};

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';
    const isWaliKelas = auth.guru?.is_wali_kelas === true;

    // Susun nav items sesuai role
    let navItems: NavItem[] = [];
    if (isAdmin) {
        navItems = adminNavItems;
    } else {
        navItems = isWaliKelas
            ? [...guruNavItemsBase, waliKelasNavItem]
            : guruNavItemsBase;
    }

    const dashboardUrl = isAdmin ? '/admin/dashboard' : '/guru/dashboard';

    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-white/10 bg-[#0B2559]">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 active:bg-white/15">
                            <Link href={dashboardUrl} prefetch>
                                <img src="/logo.png" alt="SMKN 69" className="h-10 w-auto object-contain mt-1" />
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="text-sm font-bold text-white tracking-wide">SMKN 69 JAKARTA</span>
                                    <span className="text-white/75 text-xs font-normal">
                                        {isAdmin ? 'Panel Administrator' : 'Portal Guru'}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} label={isAdmin ? 'Menu Administrator' : 'Menu Utama'} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
