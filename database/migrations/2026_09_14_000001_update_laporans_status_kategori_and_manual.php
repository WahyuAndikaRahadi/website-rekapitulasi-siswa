<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->boolean('is_manual')->default(false)->after('keterangan_tambahan');
            $table->string('status', 50)->default('baru dilaporkan')->change();
            $table->string('kategori', 50)->default('pelanggaran')->change();
        });

        Schema::table('poin_masters', function (Blueprint $table) {
            $table->string('kategori', 50)->default('pelanggaran')->change();
        });

        // Migrate existing records
        DB::table('poin_masters')->where('kategori', 'kebaikan')->update(['kategori' => 'prestasi']);
        DB::table('laporans')->where('kategori', 'kebaikan')->update(['kategori' => 'prestasi']);
        DB::table('laporans')->where('status', 'pending')->update(['status' => 'baru dilaporkan']);
        DB::table('laporans')->where('status', 'ditindaklanjuti')->update(['status' => 'selesai']);
    }

    public function down(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->dropColumn('is_manual');
        });
    }
};
