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
        'kelas_id',
        'tahun_ajaran_id',
    ];

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

    // --- Skor ---

    /**
     * Skor resmi: hanya laporan yang sudah ditindaklanjuti.
     */
    public function skorResmi(): int
    {
        return (int) $this->laporans()
            ->where('status', 'ditindaklanjuti')
            ->sum('poin_diberikan');
    }

    /**
     * Skor sementara: termasuk laporan pending.
     */
    public function skorSementara(): int
    {
        return (int) $this->laporans()
            ->whereIn('status', ['pending', 'ditindaklanjuti'])
            ->sum('poin_diberikan');
    }
}
