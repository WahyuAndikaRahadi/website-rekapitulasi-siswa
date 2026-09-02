<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TahunAjaran extends Model
{
    protected $fillable = [
        'label',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    // --- Relasi ---

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class);
    }

    public function murids(): HasMany
    {
        return $this->hasMany(Murid::class);
    }

    public function jenisPelanggarans(): HasMany
    {
        return $this->hasMany(JenisPelanggaran::class);
    }

    public function laporans(): HasMany
    {
        return $this->hasMany(Laporan::class);
    }

    // --- Helper static ---

    public static function aktif(): ?self
    {
        return static::where('is_active', true)->first();
    }
}
