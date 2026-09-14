<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PoinMaster extends Model
{
    protected $fillable = [
        'kategori',
        'nama',
        'poin',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'poin' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scopePelanggaran($query)
    {
        return $query->where('kategori', 'pelanggaran');
    }

    public function scopeKebaikan($query)
    {
        return $query->where('kategori', 'kebaikan');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
