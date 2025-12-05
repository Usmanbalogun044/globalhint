<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;
use App\Traits\HandleFileUploads;
use Illuminate\Database\Eloquent\Collection;

class MessageService
{
    use HandleFileUploads;

    public function getConversation(User $user1, User $user2): Collection
    {
        return Message::where(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user1->id)->where('receiver_id', $user2->id);
        })->orWhere(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user2->id)->where('receiver_id', $user1->id);
        })
        ->orderBy('created_at', 'asc')
        ->get();
    }

    public function getConversations(User $user): Collection
    {
        // Get IDs of users who have sent messages to or received messages from the current user
        $sentIds = Message::where('sender_id', $user->id)->pluck('receiver_id')->unique();
        $receivedIds = Message::where('receiver_id', $user->id)->pluck('sender_id')->unique();
        
        $userIds = $sentIds->merge($receivedIds)->unique();

        $users = User::whereIn('id', $userIds)->get();

        // Attach last message
        $users->each(function ($otherUser) use ($user) {
            $lastMessage = Message::where(function ($q) use ($user, $otherUser) {
                $q->where('sender_id', $user->id)->where('receiver_id', $otherUser->id);
            })->orWhere(function ($q) use ($user, $otherUser) {
                $q->where('sender_id', $otherUser->id)->where('receiver_id', $user->id);
            })->latest()->first();

            $otherUser->last_message = $lastMessage;
        });

        return $users->sortByDesc('last_message.created_at')->values();
    }

    public function sendMessage(User $sender, array $data): Message
    {
        $mediaUrl = null;
        
        if (isset($data['media']) && $data['media'] instanceof \Illuminate\Http\UploadedFile) {
            $mediaUrl = $this->uploadFile($data['media'], 'messages/media');
        }

        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'] ?? null,
            'type' => $data['type'] ?? 'text',
            'media_url' => $mediaUrl,
        ]);

        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return $message;
    }

    public function markAsRead(User $user, int $messageId): bool
    {
        $message = Message::where('id', $messageId)
            ->where('receiver_id', $user->id)
            ->first();

        if ($message) {
            $message->update(['read_at' => now()]);
            return true;
        }

        return false;
    }
    public function getUnreadCount(User $user): int
    {
        return Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function markConversationAsRead(User $user, int $senderId): void
    {
        Message::where('receiver_id', $user->id)
            ->where('sender_id', $senderId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
