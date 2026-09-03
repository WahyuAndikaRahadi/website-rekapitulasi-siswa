<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporans', function (Blueprint $table) {
            $table->integer('poin_diberikan')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Restore to non-nullable (will fail if any NULLs exist in DB)
        Schema::table('laporans', function (Blueprint $table) {
            $table->integer('poin_diberikan')->default(0)->change();
        });
    }
};
