<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Message;
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

        // Create a test user
        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'username' => 'testuser',
        ]);

        // Create 10 other users
        $users = User::factory(10)->create();

        // Create posts for each user
        $users->each(function ($user) {
            Post::factory(5)->create([
                'user_id' => $user->id,
            ]);
        });
        
        // Create posts for test user
        Post::factory(5)->create([
            'user_id' => $testUser->id,
        ]);

        // Create comments
        Post::all()->each(function ($post) use ($users, $testUser) {
            $commenters = $users->merge([$testUser])->random(3);
            foreach ($commenters as $commenter) {
                Comment::factory()->create([
                    'post_id' => $post->id,
                    'user_id' => $commenter->id,
                ]);
            }
        });

        // Create messages between test user and others
        $users->each(function ($user) use ($testUser) {
            // Incoming messages
            Message::factory(3)->create([
                'sender_id' => $user->id,
                'receiver_id' => $testUser->id,
            ]);

            // Outgoing messages
            Message::factory(2)->create([
                'sender_id' => $testUser->id,
                'receiver_id' => $user->id,
            ]);
        });
    }
}
