import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationProps {
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total: number;
    currentPage?: number;
    lastPage?: number;
    className?: string;
}

export function Pagination({ links, from, to, total, currentPage, lastPage, className = '' }: PaginationProps) {
    if (!links || links.length === 0 || total === 0) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    // Format clean label for page numbers (remove any &laquo;, &raquo;, etc.)
    const formatLabel = (label: string) => {
        return label
            .replace(/&laquo;/g, '')
            .replace(/&raquo;/g, '')
            .replace(/&lsaquo;/g, '')
            .replace(/&rsaquo;/g, '')
            .replace(/pagination\.previous/i, '')
            .replace(/pagination\.next/i, '')
            .replace(/Previous/i, '')
            .replace(/Next/i, '')
            .trim();
    };

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-muted/10 ${className}`}>
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
                {from !== undefined && to !== undefined ? (
                    <>Menampilkan <span className="font-medium text-foreground">{from}</span>–<span className="font-medium text-foreground">{to}</span> dari <span className="font-medium text-foreground">{total}</span> data</>
                ) : currentPage !== undefined && lastPage !== undefined ? (
                    <>Halaman <span className="font-medium text-foreground">{currentPage}</span> dari <span className="font-medium text-foreground">{lastPage}</span> ({total} total)</>
                ) : (
                    <>Total <span className="font-medium text-foreground">{total}</span> data</>
                )}
            </p>
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {prev?.url ? (
                    <Link href={prev.url} preserveScroll preserveState>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0" title="Halaman Sebelumnya">
                            <ChevronLeft className="size-4" />
                            <span className="sr-only">Sebelumnya</span>
                        </Button>
                    </Link>
                ) : (
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 opacity-40 cursor-not-allowed" disabled>
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                {pages.map((link, i) => {
                    const cleanLabel = formatLabel(link.label);
                    if (!cleanLabel) return null;

                    return link.url ? (
                        <Link key={i} href={link.url} preserveScroll preserveState>
                            <Button
                                variant={link.active ? 'primary' : 'secondary'}
                                size="sm"
                                className={`h-8 min-w-8 px-2 text-xs font-semibold ${
                                    link.active ? 'shadow-xs' : 'text-foreground hover:bg-muted'
                                }`}
                            >
                                {cleanLabel}
                            </Button>
                        </Link>
                    ) : (
                        <span key={i} className="text-muted-foreground px-1.5 text-xs font-medium select-none">
                            {cleanLabel === '...' || cleanLabel === '…' ? '…' : cleanLabel}
                        </span>
                    );
                })}

                {next?.url ? (
                    <Link href={next.url} preserveScroll preserveState>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0" title="Halaman Selanjutnya">
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Selanjutnya</span>
                        </Button>
                    </Link>
                ) : (
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 opacity-40 cursor-not-allowed" disabled>
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
