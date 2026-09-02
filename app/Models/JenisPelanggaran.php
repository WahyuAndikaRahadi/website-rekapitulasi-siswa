<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisPelanggaran extends Model
{
    protected $fillable = [
        'kode',
        'keterangan',
        'kategori',
        'tingkat_keparahan',
        'poin',
        'tahun_ajaran_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'poin' => 'integer',
        ];
    }

    // --- Relasi ---

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(Laporan::class);
    }

    // --- Scopes ---

    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePelanggaran($query)
    {
        return $query->where('kategori', 'pelanggaran');
    }

    public function scopeKebaikan($query)
    {
        return $query->where('kategori', 'kebaikan');
    }

    // --- Helper ---

    /**
     * Nilai poin yang sesungguhnya terhadap skor murid.
     * Kebaikan = +poin, Pelanggaran = -poin
     */
    public function poinEfektif(): int
    {
        return $this->kategori === 'kebaikan' ? $this->poin : -$this->poin;
    }
}
