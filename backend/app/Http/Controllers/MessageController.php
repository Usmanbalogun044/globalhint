<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MessageService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    protected $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function index(Request $request, User $user)
    {
        $messages = $this->messageService->getConversation($request->user(), $user);
        return response()->json($messages);
    }

    public function conversations(Request $request)
    {
        $conversations = $this->messageService->getConversations($request->user());
        return response()->json($conversations);
    }

    public function store(Request $request, User $user)
    {
        $request->validate([
            'content' => 'nullable|string',
            'type' => 'required|in:text,image,video,audio',
            'media' => 'nullable|file|max:20480',
        ]);

        $data = $request->all();
        $data['receiver_id'] = $user->id;

        $message = $this->messageService->sendMessage($request->user(), $data);

        return response()->json($message, 201);
    }

    public function markAsRead(Request $request, $id)
    {
        $success = $this->messageService->markAsRead($request->user(), $id);

        if (!$success) {
            return response()->json(['message' => 'Message not found or not yours'], 404);
        }

        return response()->json(['message' => 'Marked as read']);
    }
}
