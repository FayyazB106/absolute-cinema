<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('statuses', 'status')) {
            // Store existing data
            $existingStatuses = DB::table('statuses')->get();

            Schema::table('statuses', function (Blueprint $table) {
                // Drop old column
                $table->dropColumn('status');

                // Add new columns
                $table->string('name_en')->after('id');
                $table->string('name_ar')->after('name_en');
            });

            // Migrate the data
            foreach ($existingStatuses as $status) {
                DB::table('statuses')
                    ->where('id', $status->id)
                    ->update([
                        'name_en' => $status->status,
                        'name_ar' => $this->getArabicName($status->status),
                        'updated_at' => now()
                    ]);
            }
        }
    }

    private function getArabicName($englishName): string
    {
        return match (strtolower($englishName)) {
            'released' => 'صدر',
            'coming soon' => 'قريباً',
            'unavailable' => 'غير متاح',
            default => $englishName
        };
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('statuses', function (Blueprint $table) {
            $table->dropColumn(['name_en', 'name_ar']);
            $table->string('status');
        });
    }
};
