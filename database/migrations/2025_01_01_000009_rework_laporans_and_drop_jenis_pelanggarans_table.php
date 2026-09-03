<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            // Drop foreign key and column to jenis_pelanggarans
            if (Schema::hasColumn('laporans', 'jenis_pelanggaran_id')) {
                $table->dropForeign(['jenis_pelanggaran_id']);
                $table->dropColumn('jenis_pelanggaran_id');
            }

            // Add new direct columns
            $table->enum('kategori', ['pelanggaran', 'kebaikan'])->default('pelanggaran')->after('murid_id');
            $table->enum('tingkat_keparahan', ['ringan', 'sedang', 'berat'])->default('ringan')->after('kategori');
            $table->string('keterangan', 255)->after('tingkat_keparahan');
        });

        Schema::dropIfExists('jenis_pelanggarans');
    }

    public function down(): void
    {
        Schema::create('jenis_pelanggarans', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20);
            $table->string('keterangan', 255);
            $table->enum('kategori', ['pelanggaran', 'kebaikan']);
            $table->enum('tingkat_keparahan', ['ringan', 'sedang', 'berat'])->nullable();
            $table->integer('poin');
            $table->foreignId('tahun_ajaran_id')->constrained('tahun_ajarans')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('laporans', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'tingkat_keparahan', 'keterangan']);
            $table->foreignId('jenis_pelanggaran_id')->nullable()->constrained('jenis_pelanggarans')->cascadeOnDelete();
        });
    }
};
