import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from: number;
    to: number;
    total: number;
}

export function Pagination({ links, from, to, total }: PaginationProps) {
    if (total === 0) return null;

    const prev = links.find((l) => l.label.includes('Previous') || l.label.includes('&laquo;'));
    const next = links.find((l) => l.label.includes('Next') || l.label.includes('&raquo;'));
    const pages = links.filter((l) => !l.label.includes('Previous') && !l.label.includes('Next') && !l.label.includes('&'));

    return (
        <div className="flex items-center justify-between border-t px-2 pt-4">
            <p className="text-muted-foreground text-xs">
                Menampilkan {from}–{to} dari {total} data
            </p>
            <div className="flex items-center gap-1">
                {prev?.url ? (
                    <Link href={prev.url}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                        <ChevronLeft className="size-4" />
                    </Button>
                )}

                {pages.map((link, i) => (
                    link.url ? (
                        <Link key={i} href={link.url}>
                            <Button
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="h-8 min-w-8 px-2"
                            >
                                {link.label}
                            </Button>
                        </Link>
                    ) : (
                        <span key={i} className="text-muted-foreground px-2 text-sm">…</span>
                    )
                ))}

                {next?.url ? (
                    <Link href={next.url}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <ChevronRight className="size-4" />
                        </Button>
                    </Link>
                ) : (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                        <ChevronRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
