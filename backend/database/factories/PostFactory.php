<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['text', 'image', 'video']);
        $mediaUrl = null;

        if ($type === 'image') {
            $mediaUrl = 'https://picsum.photos/seed/' . $this->faker->uuid . '/800/600';
        } elseif ($type === 'video') {
            $mediaUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Sample video
        }

        return [
            'user_id' => User::factory(),
            'content' => $this->faker->paragraph(),
            'type' => $type,
            'media_url' => $mediaUrl,
            'categories' => $this->faker->randomElements(['Technology', 'Lifestyle', 'Gaming', 'Art', 'Music', 'News', 'Jobs'], rand(1, 3)),
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ];
    }
}
