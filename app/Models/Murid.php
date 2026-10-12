<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Murid extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'nama',
        'nis',
        'nisn',
        'no_telp',
        'no_ortu',
        'status',
        'kelas_id',
        'tahun_ajaran_id',
    ];

    // --- Scopes ---

    public function scopeAktif($query)
    {
        return $query->where('status', 'aktif');
    }

    public function scopeAlumni($query)
    {
        return $query->where('status', 'alumni');
    }

    public function isAlumni(): bool
    {
        return $this->status === 'alumni';
    }

    // --- Relasi ---

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(Laporan::class);
    }

    public function suratPanggils(): HasMany
    {
        return $this->hasMany(SuratPanggil::class);
    }

    // --- Kalkulasi Poin Mandiri & Terintegrasi ---

    /**
     * Total kumulatif poin prestasi siswa yang valid.
     */
    public function poinPrestasi(): int
    {
        if ($this->relationLoaded('laporans')) {
            return abs((int) $this->laporans
                ->filter(fn($l) => in_array($l->kategori, ['prestasi', 'kebaikan'])
                    && (!$l->is_manual || !in_array($l->status, ['menunggu verifikasi', 'ditolak'])))
                ->sum('poin_diberikan'));
        }

        return abs((int) $this->laporans()
            ->prestasi()
            ->validPoin()
            ->sum('poin_diberikan'));
    }

    /**
     * Total kotor akumulasi pelanggaran siswa sebelum pengurangan prestasi.
     */
    public function poinPelanggaranKotor(): int
    {
        if ($this->relationLoaded('laporans')) {
            return abs((int) $this->laporans
                ->filter(fn($l) => $l->kategori === 'pelanggaran'
                    && (!$l->is_manual || !in_array($l->status, ['menunggu verifikasi', 'ditolak'])))
                ->sum('poin_diberikan'));
        }

        return abs((int) $this->laporans()
            ->pelanggaran()
            ->validPoin()
            ->sum('poin_diberikan'));
    }

    /**
     * Poin pelanggaran aktif setelah dikurangi deduksi reward prestasi.
     * Tidak akan bernilai negatif (minimal 0).
     */
    public function poinPelanggaran(): int
    {
        $pelanggaran = $this->poinPelanggaranKotor();
        $prestasi = $this->poinPrestasi();

        return max(0, $pelanggaran - $prestasi);
    }

    /**
     * Kualifikasi kumulatif poin pelanggaran (sesuai tata tertib SMKN 69).
     * 0 - 25: Baik, 26 - 74: Cukup, >= 75: Kurang.
     */
    public function kualifikasiPoin(): string
    {
        $poin = $this->poinPelanggaran();
        if ($poin <= 25) {
            return 'Baik';
        }
        if ($poin <= 74) {
            return 'Cukup';
        }
        return 'Kurang';
    }

    /**
     * Tahapan intervensi & pembinaan berdasarkan akumulasi poin pelanggaran aktif.
     */
    public function tahapPembinaan(): string
    {
        $poin = $this->poinPelanggaran();
        if ($poin >= 100) {
            return 'Tahap IV (Penanganan Khusus)';
        }
        if ($poin >= 75) {
            return 'Tahap III (Peringatan III / K-3)';
        }
        if ($poin >= 50) {
            return 'Tahap II (Peringatan II / K-2)';
        }
        if ($poin >= 25) {
            return 'Tahap I (Peringatan I / K-1)';
        }
        return 'Normal';
    }

    /**
     * Poin akumulasi = total poin penghargaan (prestasi/kebaikan) - total poin pelanggaran.
     */
    public function poinAkumulasi(): int
    {
        return $this->poinPrestasi() - $this->poinPelanggaranKotor();
    }

    /**
     * Backward-compatibility alias.
     */
    public function skorResmi(): int
    {
        return $this->poinPrestasi() - $this->poinPelanggaran();
    }
}
