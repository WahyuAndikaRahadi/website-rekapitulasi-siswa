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

type PageItem =
    | { type: 'page'; page: number; url: string; active: boolean }
    | { type: 'ellipsis'; key: string };

export function Pagination({ links, from, to, total, currentPage, lastPage, className = '' }: PaginationProps) {
    if (!links || links.length === 0 || total === 0) return null;

    const prev = links[0];
    const next = links[links.length - 1];

    // Build URL map and find active page & total pages
    const pageUrlMap = new Map<number, string>();
    let detectedCurrentPage = 1;
    let maxPageNum = 1;
    let sampleUrl: string | null = null;

    links.forEach((l) => {
        if (l.url && !sampleUrl) {
            sampleUrl = l.url;
        }

        const rawLabel = l.label
            .replace(/&laquo;/g, '')
            .replace(/&raquo;/g, '')
            .replace(/&lsaquo;/g, '')
            .replace(/&rsaquo;/g, '')
            .replace(/pagination\.previous/i, '')
            .replace(/pagination\.next/i, '')
            .replace(/Previous/i, '')
            .replace(/Next/i, '')
            .trim();

        const num = parseInt(rawLabel, 10);
        if (!isNaN(num)) {
            if (num > maxPageNum) maxPageNum = num;
            if (l.active) detectedCurrentPage = num;
            if (l.url) pageUrlMap.set(num, l.url);
        }
    });

    const currPage = currentPage ?? detectedCurrentPage;
    const totalPages = lastPage ?? maxPageNum;

    // Helper to derive URL for any page number
    const getUrl = (pageNum: number): string => {
        if (pageUrlMap.has(pageNum)) {
            return pageUrlMap.get(pageNum)!;
        }
        if (sampleUrl) {
            try {
                // Keep relative or full URL
                if (sampleUrl.startsWith('http')) {
                    const parsed = new URL(sampleUrl);
                    parsed.searchParams.set('page', pageNum.toString());
                    return parsed.pathname + parsed.search;
                } else {
                    const parsed = new URL(sampleUrl, 'http://localhost');
                    parsed.searchParams.set('page', pageNum.toString());
                    return parsed.pathname + parsed.search;
                }
            } catch {
                return `?page=${pageNum}`;
            }
        }
        return `?page=${pageNum}`;
    };

    // Construct sliding window pagination items
    const generatePageItems = (): PageItem[] => {
        const items: PageItem[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                items.push({
                    type: 'page',
                    page: i,
                    url: getUrl(i),
                    active: i === currPage,
                });
            }
            return items;
        }

        // Case: totalPages > 7
        if (currPage <= 4) {
            // Near start: 1, 2, 3, 4, 5, ..., totalPages
            for (let i = 1; i <= 5; i++) {
                items.push({
                    type: 'page',
                    page: i,
                    url: getUrl(i),
                    active: i === currPage,
                });
            }
            items.push({ type: 'ellipsis', key: 'dots-end' });
            items.push({
                type: 'page',
                page: totalPages,
                url: getUrl(totalPages),
                active: totalPages === currPage,
            });
        } else if (currPage >= totalPages - 3) {
            // Near end: 1, ..., totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages
            items.push({
                type: 'page',
                page: 1,
                url: getUrl(1),
                active: 1 === currPage,
            });
            items.push({ type: 'ellipsis', key: 'dots-start' });
            for (let i = totalPages - 4; i <= totalPages; i++) {
                items.push({
                    type: 'page',
                    page: i,
                    url: getUrl(i),
                    active: i === currPage,
                });
            }
        } else {
            // In middle: 1, ..., currPage - 1, currPage, currPage + 1, ..., totalPages
            items.push({
                type: 'page',
                page: 1,
                url: getUrl(1),
                active: 1 === currPage,
            });
            items.push({ type: 'ellipsis', key: 'dots-start' });
            for (let i = currPage - 1; i <= currPage + 1; i++) {
                items.push({
                    type: 'page',
                    page: i,
                    url: getUrl(i),
                    active: i === currPage,
                });
            }
            items.push({ type: 'ellipsis', key: 'dots-end' });
            items.push({
                type: 'page',
                page: totalPages,
                url: getUrl(totalPages),
                active: totalPages === currPage,
            });
        }

        return items;
    };

    const pageItems = generatePageItems();

    // If only 1 page, don't show pagination controls
    if (totalPages <= 1) {
        return (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-muted/10 ${className}`}>
                <p className="text-xs text-muted-foreground">
                    {from !== undefined && to !== undefined ? (
                        <>Menampilkan <span className="font-semibold text-foreground">{from}</span>–<span className="font-semibold text-foreground">{to}</span> dari <span className="font-semibold text-foreground">{total}</span> data</>
                    ) : (
                        <>Total <span className="font-semibold text-foreground">{total}</span> data</>
                    )}
                </p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-muted/10 ${className}`}>
            <p className="text-xs text-muted-foreground order-2 sm:order-1">
                {from !== undefined && to !== undefined ? (
                    <>Menampilkan <span className="font-semibold text-foreground">{from}</span>–<span className="font-semibold text-foreground">{to}</span> dari <span className="font-semibold text-foreground">{total}</span> data</>
                ) : currentPage !== undefined && lastPage !== undefined ? (
                    <>Halaman <span className="font-semibold text-foreground">{currentPage}</span> dari <span className="font-semibold text-foreground">{lastPage}</span> ({total} total)</>
                ) : (
                    <>Total <span className="font-semibold text-foreground">{total}</span> data</>
                )}
            </p>
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Tombol Previous */}
                {prev?.url ? (
                    <Link href={prev.url} preserveScroll preserveState>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Halaman Sebelumnya">
                            <ChevronLeft className="size-4" />
                            <span className="sr-only">Sebelumnya</span>
                        </Button>
                    </Link>
                ) : (
                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0 opacity-40 cursor-not-allowed" disabled>
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                {/* Nomor Halaman & Ellipsis */}
                {pageItems.map((item) => {
                    if (item.type === 'ellipsis') {
                        return (
                            <span key={item.key} className="text-muted-foreground px-1.5 text-xs font-semibold select-none">
                                …
                            </span>
                        );
                    }

                    return (
                        <Link key={item.page} href={item.url} preserveScroll preserveState>
                            <Button
                                variant={item.active ? 'primary' : 'secondary'}
                                size="sm"
                                className={`h-8 min-w-8 px-2.5 text-xs font-semibold transition-all cursor-pointer ${
                                    item.active
                                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                                        : 'text-foreground hover:bg-muted font-medium'
                                }`}
                            >
                                {item.page}
                            </Button>
                        </Link>
                    );
                })}

                {/* Tombol Next */}
                {next?.url ? (
                    <Link href={next.url} preserveScroll preserveState>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Halaman Selanjutnya">
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
