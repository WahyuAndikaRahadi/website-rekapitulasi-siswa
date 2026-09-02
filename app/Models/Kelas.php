<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'tingkat',
        'tahun_ajaran_id',
    ];

    // --- Relasi ---

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function murids(): HasMany
    {
        return $this->hasMany(Murid::class);
    }

    /**
     * Wali kelas dari kelas ini (satu guru yang punya wali_kelas_id ke kelas ini).
     */
    public function waliKelas(): HasOne
    {
        return $this->hasOne(Guru::class, 'wali_kelas_id');
    }

    /**
     * Semua guru yang mengajar di kelas ini (via pivot guru_kelas).
     */
    public function gurus(): BelongsToMany
    {
        return $this->belongsToMany(Guru::class, 'guru_kelas')
                    ->withPivot('mapel')
                    ->withTimestamps();
    }
}
