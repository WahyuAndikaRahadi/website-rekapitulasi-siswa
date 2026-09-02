import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], label = 'Menu' }: { items: NavItem[]; label?: string }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="text-white/60 text-[11px] font-semibold tracking-wider uppercase">{label}</SidebarGroupLabel>
            <SidebarMenu className="gap-1 mt-1">
                {items.map((item) => {
                    const isActive = page.url.startsWith(item.url);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.title}
                                className={`transition-all duration-150 ${
                                    isActive
                                        ? 'bg-[#1E5FA8] text-white font-semibold shadow-sm hover:bg-[#1E5FA8] hover:text-white'
                                        : 'text-white/80 hover:bg-white/10 hover:text-white active:bg-white/15'
                                }`}
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className={`size-4 ${isActive ? 'text-white' : 'text-white/80'}`} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
