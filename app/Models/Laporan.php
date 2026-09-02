<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Laporan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'guru_id',
        'murid_id',
        'jenis_pelanggaran_id',
        'tanggal_kejadian',
        'keterangan_tambahan',
        'poin_diberikan',
        'status',
        'tindak_lanjut',
        'ditindaklanjuti_oleh',
        'ditindaklanjuti_at',
        'tahun_ajaran_id',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_kejadian'   => 'date',
            'ditindaklanjuti_at' => 'datetime',
            'poin_diberikan'     => 'integer',
        ];
    }

    // --- Relasi ---

    public function guru(): BelongsTo
    {
        return $this->belongsTo(Guru::class);
    }

    public function murid(): BelongsTo
    {
        return $this->belongsTo(Murid::class);
    }

    public function jenisPelanggaran(): BelongsTo
    {
        return $this->belongsTo(JenisPelanggaran::class);
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function ditindaklanjutiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ditindaklanjuti_oleh');
    }

    public function bukti(): HasMany
    {
        return $this->hasMany(BuktiLaporan::class);
    }

    // --- Scopes ---

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDitindaklanjuti($query)
    {
        return $query->where('status', 'ditindaklanjuti');
    }

    public function scopeDitolak($query)
    {
        return $query->where('status', 'ditolak');
    }

    // --- Helper ---

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDitindaklanjuti(): bool
    {
        return $this->status === 'ditindaklanjuti';
    }

    /**
     * Guru hanya boleh edit selama laporan masih pending.
     */
    public function bisaDieditOlehGuru(): bool
    {
        return $this->isPending();
    }
}
