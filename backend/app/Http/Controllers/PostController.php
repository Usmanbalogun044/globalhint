<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'category'])
            ->withCount('votes')
            ->latest();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('country')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('country', $request->country);
            });
        }

        $posts = $query->paginate(20);
            
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|in:text,image,video,live',
            'media' => 'nullable|file|max:10240', // Max 10MB
        ]);

        $data = $request->all();

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('uploads', 'public');
            $data['media_url'] = asset('storage/' . $path);
        }

        $post = $request->user()->posts()->create($data);

        return response()->json($post->load('user', 'category'), 201);
    }

    public function vote(Request $request, Post $post)
    {
        $request->validate([
            'is_upvote' => 'required|boolean',
        ]);

        $vote = $post->votes()->updateOrCreate(
            ['user_id' => $request->user()->id],
            ['is_upvote' => $request->is_upvote]
        );

        return response()->json($vote);
    }

    public function getTrendingCountries()
    {
        // Get countries with the most users or posts
        $countries = \App\Models\User::select('country')
            ->whereNotNull('country')
            ->selectRaw('count(*) as count')
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        return response()->json($countries);
    }
}
