<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Services\CommentService;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    protected $commentService;

    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }

    public function index(Post $post)
    {
        $comments = $this->commentService->getPostComments($post);
        return response()->json($comments);
    }

    public function store(Request $request, Post $post)
    {
        $request->validate([
            'content' => 'required|string',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $data = $request->all();
        $data['post_id'] = $post->id;

        $comment = $this->commentService->createComment($request->user(), $data);

        return response()->json($comment->load('user'), 201);
    }

    public function destroy(Request $request, Comment $comment)
    {
        $deleted = $this->commentService->deleteComment($request->user(), $comment);

        if (!$deleted) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['message' => 'Comment deleted']);
    }
}
