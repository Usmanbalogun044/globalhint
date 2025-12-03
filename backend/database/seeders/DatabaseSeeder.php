<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Categories
        $categories = ['Technology', 'Lifestyle', 'Gaming', 'Art', 'Music'];
        foreach ($categories as $cat) {
            Category::create(['name' => $cat, 'slug' => strtolower($cat)]);
        }

        // Create Users
        $users = [
            [
                'name' => 'Alice Wonderland',
                'username' => 'alice',
                'email' => 'alice@example.com',
                'password' => Hash::make('password'),
                'bio' => 'Digital explorer and coffee enthusiast.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'
            ],
            [
                'name' => 'Bob Builder',
                'username' => 'bob_builds',
                'email' => 'bob@example.com',
                'password' => Hash::make('password'),
                'bio' => 'Building the future, one brick at a time.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'
            ],
            [
                'name' => 'Charlie Chef',
                'username' => 'chef_charlie',
                'email' => 'charlie@example.com',
                'password' => Hash::make('password'),
                'bio' => 'Culinary artist. Food is love.',
                'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie'
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        // Create Posts
        $allUsers = User::all();
        $allCategories = Category::all();

        foreach ($allUsers as $user) {
            for ($i = 0; $i < 3; $i++) {
                Post::create([
                    'user_id' => $user->id,
                    'category_id' => $allCategories->random()->id,
                    'content' => "Just sharing some thoughts on " . $allCategories->random()->name . ". #Globalhint",
                    'type' => 'text'
                ]);
            }
        }
    }
}
