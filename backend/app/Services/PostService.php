<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use App\Traits\HandleFileUploads;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PostService
{
    use HandleFileUploads;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getPosts(array $filters = [], ?User $currentUser = null): LengthAwarePaginator
    {
        $query = Post::with(['user', 'votes'])
            ->withCount(['votes', 'comments'])
            ->latest();

        if ($currentUser) {
            $query->addSelect(['posts.*'])
                ->selectSub(function ($q) use ($currentUser) {
                    $q->from('follows')
                        ->selectRaw('count(*)')
                        ->whereColumn('following_id', 'posts.user_id')
                        ->where('follower_id', $currentUser->id);
                }, 'is_shadowing');
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['country'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('country', $filters['country']);
            });
        }

        if (!empty($filters['category'])) {
            // Check if the category exists in the JSON array
            $query->whereJsonContains('categories', $filters['category']);
        }

        return $query->paginate(20);
    }



    public function createPost(User $user, array $data): Post
    {
        $mediaUrl = null;
        
        if (isset($data['media']) && $data['media'] instanceof \Illuminate\Http\UploadedFile) {
            $path = match($data['type'] ?? 'text') {
                'video' => 'posts/videos',
                'audio', 'music' => 'posts/audio',
                'image' => 'posts/images',
                default => 'posts/media',
            };
            
            $mediaUrl = $this->uploadFile($data['media'], $path);
        }

        // Ensure categories is an array
        $categories = $data['categories'] ?? [];
        if (is_string($categories)) {
            // Handle comma-separated string if sent that way
            $categories = array_map('trim', explode(',', $categories));
        } elseif (!is_array($categories)) {
             // Fallback if single value or null
             $categories = $data['category'] ? [$data['category']] : ['General'];
        }

        return Post::create([
            'user_id' => $user->id,
            'content' => $data['content'] ?? null,
            'type' => $data['type'] ?? 'text',
            'media_url' => $mediaUrl,
            'categories' => $categories,
        ]);
    }

    public function votePost(User $user, Post $post, string $type): array
    {
        $isUpvote = $type === 'up';
        
        $existingVote = $post->votes()->where('user_id', $user->id)->first();

        if ($existingVote) {
            if ($existingVote->is_upvote === $isUpvote) {
                // Toggle off if clicking same vote
                $existingVote->delete();
                $status = 'removed';
            } else {
                // Change vote
                $existingVote->update(['is_upvote' => $isUpvote]);
                $status = 'updated';
            }
        } else {
            // New vote
            $post->votes()->create([
                'user_id' => $user->id,
                'is_upvote' => $isUpvote
            ]);
            $status = 'created';

            // Notify post owner if not the voter
            if ($post->user_id !== $user->id) {
                $this->notificationService->create(
                    $post->user,
                    'vote',
                    [
                        'sender_id' => $user->id,
                        'sender_name' => $user->name,
                        'sender_username' => $user->username,
                        'sender_avatar' => $user->avatar,
                        'type' => 'vote',
                        'vote_type' => $type,
                        'post_id' => $post->id,
                    ]
                );
            }
        }

        return [
            'status' => $status,
            'votes_count' => $post->votes()->where('is_upvote', true)->count() - $post->votes()->where('is_upvote', false)->count()
        ];
    }
}
