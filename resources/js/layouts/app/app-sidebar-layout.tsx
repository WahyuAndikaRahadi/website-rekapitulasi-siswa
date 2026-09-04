import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FlashMessage } from '@/components/flash-message';
import { pageVariants } from '@/lib/motion-variants';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    const { url } = usePage();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashMessage />
                <Toaster
                    position="top-right"
                    gutter={8}
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#FFFFFF',
                            color: '#0F172A',
                            border: '1px solid #E2E8F0',
                            borderRadius: '0.5rem',
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: 500,
                            boxShadow: '0 4px 12px -2px rgba(11,37,89,0.12)',
                            maxWidth: '400px',
                        },
                        success: {
                            duration: 4500,
                            style: { borderLeft: '4px solid #2E8B57' },
                            iconTheme: { primary: '#2E8B57', secondary: '#FFFFFF' },
                        },
                        error: {
                            duration: 7000,
                            style: { borderLeft: '4px solid #D6293E' },
                            iconTheme: { primary: '#D6293E', secondary: '#FFFFFF' },
                        },
                    }}
                />
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={url}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex flex-1 flex-col min-w-0"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </AppContent>
        </AppShell>
    );
}
