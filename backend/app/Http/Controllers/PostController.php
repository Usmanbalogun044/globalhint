<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected $postService;

    public function __construct(\App\Services\PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['user_id', 'country', 'category']);
        $posts = $this->postService->getPosts($filters, $request->user('sanctum'));
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'nullable|string',
            'type' => 'required|in:text,image,video,audio,music,live',
            'media' => 'nullable|file|max:102400', // Max 100MB
            'categories' => 'nullable|array',
            'categories.*' => 'string',
            'category' => 'nullable|string', // Backward compatibility
        ]);

        try {
            $post = $this->postService->createPost($request->user(), $request->all());
            return response()->json($post->load('user'), 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Post creation failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create hint: ' . $e->getMessage()], 500);
        }
    }

    public function vote(Request $request, Post $post)
    {
        $request->validate([
            'type' => 'required|in:up,down',
        ]);

        $result = $this->postService->votePost($request->user(), $post, $request->type);

        return response()->json($result);
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
