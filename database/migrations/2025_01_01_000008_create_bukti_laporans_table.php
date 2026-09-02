<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bukti_laporans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')->constrained('laporans')->cascadeOnDelete();
            $table->string('path_file');    // path relatif dari storage/app/public
            $table->string('nama_asli', 255)->nullable(); // nama file asli untuk ditampilkan ke user
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bukti_laporans');
    }
};
