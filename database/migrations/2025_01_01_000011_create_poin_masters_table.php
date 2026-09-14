<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('poin_masters', function (Blueprint $table) {
            $table->id();
            $table->string('kategori'); // 'pelanggaran' atau 'kebaikan'
            $table->string('nama');     // Deskripsi pelanggaran / kebaikan
            $table->integer('poin');    // Nilai poin (negatif untuk pelanggaran, positif untuk kebaikan)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('poin_masters');
    }
};
