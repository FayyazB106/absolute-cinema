<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // 1. Basic Statuses
        \App\Models\Status::insert([
            ['status' => 'Released'],
            ['status' => 'Coming soon'],
            ['status' => 'Unavailable']
        ]);

        // 2. Maturity Ratings
        \App\Models\Maturity::insert([
            ['maturity' => 'G'],
            ['maturity' => 'PG-13'],
            ['maturity' => 'R']
        ]);

        // 3. Some Genres
        \App\Models\Genre::insert([
            ['name_en' => 'Action', 'name_ar' => 'أكشن'],
            ['name_en' => 'Drama', 'name_ar' => 'دراما'],
            ['name_en' => 'Sci-Fi', 'name_ar' => 'خيال علمي']
        ]);

        // 4. Languages
        \App\Models\Language::insert([
            ['name_en' => 'English', 'name_ar' => 'الإنجليزية', 'code' => 'en'],
            ['name_en' => 'Arabic', 'name_ar' => 'العربية', 'code' => 'ar'],
            ['name_en' => 'French', 'name_ar' => 'الفرنسية', 'code' => 'fr']
        ]);
    }
}
