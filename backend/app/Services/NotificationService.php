<?php

namespace App\Services;

use App\Models\Notification;
use App\Events\NotificationCreated;
use App\Models\User;

class NotificationService
{
    public function create(User $recipient, string $type, array $data)
    {
        // Don't notify if user performs action on themselves (except maybe system alerts)
        if (isset($data['sender_id']) && $data['sender_id'] === $recipient->id) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $recipient->id,
            'type' => $type,
            'data' => $data,
        ]);

        // Dispatch event for real-time update
        NotificationCreated::dispatch($notification);

        return $notification;
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);
        return $notification;
    }

    public function markAllAsRead(User $user)
    {
        return $user->notifications()->whereNull('read_at')->update(['read_at' => now()]);
    }
}
