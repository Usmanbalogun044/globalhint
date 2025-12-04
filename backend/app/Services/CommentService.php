<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Collection;

class CommentService
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function getPostComments(Post $post): Collection
    {
        return $post->comments()
            ->with(['user', 'replies.user'])
            ->whereNull('parent_id')
            ->latest()
            ->get();
    }

    public function createComment(User $user, array $data): Comment
    {
        $comment = Comment::create([
            'user_id' => $user->id,
            'post_id' => $data['post_id'],
            'parent_id' => $data['parent_id'] ?? null,
            'content' => $data['content'],
        ]);

        $comment->load('user');

        // Broadcast event
        broadcast(new \App\Events\CommentCreated($comment))->toOthers();

        // Notify post owner if not the commenter
        $postOwner = $comment->post->user;
        if ($postOwner && $postOwner->id !== $user->id) {
            $this->notificationService->create(
                $postOwner,
                'comment',
                [
                    'sender_id' => $user->id,
                    'sender_name' => $user->name,
                    'sender_username' => $user->username,
                    'sender_avatar' => $user->avatar,
                    'type' => 'comment',
                    'preview' => $comment->content,
                    'post_id' => $comment->post_id,
                ]
            );
        }

        return $comment;
    }

    public function deleteComment(User $user, Comment $comment): bool
    {
        if ($comment->user_id !== $user->id) {
            return false;
        }
        return $comment->delete();
    }
}
