<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'News',
            'Jobs',
            'Opportunities/Business',
            'Travels',
            'Technology',
            'Products',
            'Education',
            'Education/Training',
            'Faith',
            'Fun',
            'Investments',
            'Gaming',
            'Art',
            'Music',
            'Lifestyle',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category],
                ['slug' => Str::slug($category)]
            );
        }
    }
}
