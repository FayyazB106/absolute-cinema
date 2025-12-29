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
        Schema::table('movies', function (Blueprint $table) {
            $table->string('poster_url')->nullable()->after('status_id');
            $table->string('featured_poster_url')->nullable()->after('poster_url');
            $table->boolean('is_featured')->default(false)->after('featured_poster_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            $table->dropColumn(['poster_url', 'featured_poster_url', 'is_featured']);
        });
    }
};
