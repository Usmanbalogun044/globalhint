<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Post;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q');

        if (!$query) {
            return response()->json(['users' => [], 'posts' => []]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(5)
            ->get();

        $posts = Post::with('user')
            ->where('content', 'like', "%{$query}%")
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'users' => $users,
            'posts' => $posts
        ]);
    }
}
