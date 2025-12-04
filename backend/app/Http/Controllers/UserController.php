<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show($username)
    {
        $user = User::where('username', $username)->firstOrFail();
        return response()->json($user->loadCount(['posts', 'followers', 'following']));
    }

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function follow(Request $request, User $user)
    {
        $request->validate([
            'type' => 'required|in:follow,shadow',
        ]);

        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 400);
        }

        $currentUser->following()->syncWithoutDetaching([
            $user->id => ['type' => $request->type]
        ]);

        // Trigger notification
        $this->notificationService->create($user, 'shadow', [
            'sender_id' => $currentUser->id,
            'sender_name' => $currentUser->name,
            'sender_username' => $currentUser->username,
            'sender_avatar' => $currentUser->avatar,
            'shadow_type' => $request->type,
        ]);

        return response()->json(['message' => 'Followed successfully']);
    }

    public function unfollow(Request $request, User $user)
    {
        $request->user()->following()->detach($user->id);
        return response()->json(['message' => 'Unfollowed successfully']);
    }

    public function suggested()
    {
        $users = User::inRandomOrder()->limit(5)->get();
        return response()->json($users);
    }
}
