<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(User $user)
    {
        return response()->json($user->loadCount(['posts', 'followers', 'following']));
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
        return response()->json(['data' => $users]);
    }
}
