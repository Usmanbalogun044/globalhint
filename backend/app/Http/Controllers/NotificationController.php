<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Fetching notifications for user: ' . $request->user()->id);
        
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(20);

        \Illuminate\Support\Facades\Log::info('Found notifications count: ' . $notifications->count());

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $this->notificationService->markAsRead($notification);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllAsRead(Request $request)
    {
        $this->notificationService->markAllAsRead($request->user());
        return response()->json(['message' => 'All marked as read']);
    }
}
