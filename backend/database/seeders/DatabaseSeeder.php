<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Message;
use App\Models\Follow;
use App\Models\Vote;
use App\Models\Notification;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as FakerFactory;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = FakerFactory::create();

        // Create Categories
        $this->call(CategorySeeder::class);

        // Create a test user
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'username' => 'testuser',
            ]
        );

        // Create 10 other users (skip if we already have enough to avoid explosive growth)
        $existingUserCount = User::count();
        $toCreate = max(0, 10 - max(0, $existingUserCount - 1)); // keep roughly 11 users total including test
        $users = $toCreate > 0 ? User::factory($toCreate)->create() : User::where('id', '!=', $testUser->id)->get();

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

        // Ensure each user has a profile
        User::all()->each(function ($user) use ($faker) {
            Profile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'display_name' => $user->name,
                    'banner_url' => 'https://picsum.photos/seed/'.$user->id.'/1200/300',
                    'profile_theme' => $faker->randomElement(['light','dark','#'.dechex(rand(0x000000,0xFFFFFF))]),
                    'is_verified' => $faker->boolean(10),
                    'visibility' => $faker->randomElement(['public','followers','private']),
                    'language_preference' => 'en',
                    'interests' => [$faker->randomElement(['tech','art','music','gaming','lifestyle'])],
                ]
            );
        });

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

        // Follows (each user follows a few others)
        $allUsers = User::all();
        $allUsers->each(function ($user) use ($allUsers) {
            $others = $allUsers->where('id', '!=', $user->id)->shuffle()->take(rand(3, 8));
            foreach ($others as $other) {
                Follow::firstOrCreate(
                    ['follower_id' => $user->id, 'following_id' => $other->id],
                    ['type' => 'follow']
                );
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

        // Votes on posts
        $posts = Post::all();
        $posts->each(function ($post) use ($allUsers) {
            $voters = $allUsers->shuffle()->take(rand(5, 15));
            foreach ($voters as $voter) {
                Vote::firstOrCreate(
                    ['user_id' => $voter->id, 'post_id' => $post->id],
                    ['is_upvote' => (bool)rand(0,1)]
                );
            }
        });

        // Basic notifications for activity
        $posts->take(50)->each(function ($post) use ($allUsers) {
            $ownerId = $post->user_id;
            $actors = $allUsers->where('id', '!=', $ownerId)->shuffle()->take(3);
            foreach ($actors as $actor) {
                Notification::create([
                    'user_id' => $ownerId,
                    'type' => rand(0,1) ? 'comment' : 'vote',
                    'data' => [
                        'actor_id' => $actor->id,
                        'post_id' => $post->id,
                        'message' => 'New activity on your post',
                    ],
                ]);
            }
        });
    }
}
