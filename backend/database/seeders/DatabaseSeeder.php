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
            ['name_en' => 'Released', 'name_ar' => 'صدر'],
            ['name_en' => 'Coming soon', 'name_ar' => 'قريباً'],
            ['name_en' => 'Unavailable', 'name_ar' => 'غير متاح']
        ]);

        // 2. Maturity Ratings
        \App\Models\MaturityRating::insert([
            ['maturity_rating' => 'G', 'ranking' => 1],
            ['maturity_rating' => 'PG-13', 'ranking' => 2],
            ['maturity_rating' => 'R', 'ranking' => 3]
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

        // 4. Some Actors
        \App\Models\Actor::insert([
            ['name_en' => 'Cillian Murphy', 'name_ar' => 'كيليان مورفي'],
            ['name_en' => 'Emily Blunt', 'name_ar' => 'إيميلي بلانت'],
            ['name_en' => 'Matt Damon', 'name_ar' => 'مات ديمون'],
            ['name_en' => 'Robert Downey Jr.', 'name_ar' => 'روبرت داوني جونيور']
        ]);

        // 5. Some Directos
        \App\Models\Director::insert([
            ['name_en' => 'Christopher Nolan', 'name_ar' => 'كريستوفر نولان'],
            ['name_en' => 'Anthony Russo', 'name_ar' => 'أنتوني روسو'],
            ['name_en' => 'Joe Russo', 'name_ar' => 'جو روسو'],
            ['name_en' => 'Joseph Kosinski', 'name_ar' => 'جوزيف كوزينسكي']
        ]);
    }
}
