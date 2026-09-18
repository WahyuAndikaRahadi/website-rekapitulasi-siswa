<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guru extends Model
{
    protected $fillable = [
        'user_id',
        'nip',
        'nama',
        'no_telp',
        'wali_kelas_id',
    ];

    // --- Relasi ---

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Kelas yang diwali-i oleh guru ini (nullable — bukan semua guru punya wali kelas).
     */
    public function waliKelasKelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class, 'wali_kelas_id');
    }

    /**
     * Semua kelas yang diampu guru ini (via pivot guru_kelas).
     */
    public function kelas(): BelongsToMany
    {
        return $this->belongsToMany(Kelas::class, 'guru_kelas')
                    ->withPivot('mapel')
                    ->withTimestamps();
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(Laporan::class);
    }

    // --- Helper ---

    public function isWaliKelas(): bool
    {
        return $this->wali_kelas_id !== null;
    }
}
