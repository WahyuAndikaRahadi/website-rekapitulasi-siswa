interface StatusBadgeProps {
    status: string;
    variant?: 'status' | 'kategori';
}

const statusConfig: Record<string, { label: string; className: string }> = {
    'menunggu verifikasi':    { label: 'Menunggu Verifikasi', className: 'bg-[#F5B700]/20 text-[#854D0E] border border-[#F5B700]/40 font-semibold animate-pulse' },
    'baru dilaporkan':        { label: 'Baru Dilaporkan',    className: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium' },
    'pembinaan tindak lanjut':{ label: 'Pembinaan Tindak Lanjut', className: 'bg-amber-50 text-amber-800 border border-amber-300 font-medium' },
    'selesai':                { label: 'Selesai',            className: 'bg-[#2E8B57]/15 text-[#14532D] border border-[#2E8B57]/30 font-medium' },
    'ditolak':                { label: 'Ditolak',            className: 'bg-[#D6293E]/15 text-[#7F1D1D] border border-[#D6293E]/30 font-medium' },
    // legacy statuses
    pending:                  { label: 'Pending',            className: 'bg-[#F5B700]/15 text-[#854D0E] border border-[#F5B700]/30 font-medium' },
    ditindaklanjuti:          { label: 'Ditindaklanjuti',    className: 'bg-[#2E8B57]/15 text-[#14532D] border border-[#2E8B57]/30 font-medium' },
    // categories
    pelanggaran:              { label: 'Pelanggaran',        className: 'bg-[#D6293E]/15 text-[#7F1D1D] border border-[#D6293E]/30 font-medium' },
    prestasi:                 { label: 'Prestasi',           className: 'bg-[#2E8B57]/15 text-[#14532D] border border-[#2E8B57]/30 font-medium' },
    kebaikan:                 { label: 'Prestasi',           className: 'bg-[#2E8B57]/15 text-[#14532D] border border-[#2E8B57]/30 font-medium' },
    // severity
    ringan:                   { label: 'Ringan',             className: 'bg-[#F5B700]/15 text-[#854D0E] border border-[#F5B700]/30 font-medium' },
    sedang:                   { label: 'Sedang',             className: 'bg-[#F5821F]/15 text-[#9A3412] border border-[#F5821F]/30 font-medium' },
    berat:                    { label: 'Berat',              className: 'bg-[#D6293E]/15 text-[#7F1D1D] border border-[#D6293E]/30 font-medium' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const key = status?.toLowerCase();
    const config = statusConfig[key] ?? { label: status, className: 'bg-muted text-foreground border border-border' };

    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs ${config.className}`}>
            {config.label}
        </span>
    );
}
