<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guru_kelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guru_id')->constrained('gurus')->cascadeOnDelete();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->string('mapel', 100)->nullable(); // mata pelajaran yang diampu di kelas ini
            $table->timestamps();

            // satu guru tidak mengajar mapel yang sama di kelas yang sama dua kali
            $table->unique(['guru_id', 'kelas_id', 'mapel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guru_kelas');
    }
};
