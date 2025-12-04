<?php

namespace App\Http\Controllers;

use App\Events\CallAccepted;
use App\Events\CallInitiated;
use App\Events\IceCandidateSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VideoCallController extends Controller
{
    public function initiate(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'offer' => 'required|array',
        ]);

        broadcast(new CallInitiated(Auth::user(), $request->receiver_id, $request->offer))->toOthers();

        return response()->json(['status' => 'Call initiated']);
    }

    public function accept(Request $request)
    {
        $request->validate([
            'caller_id' => 'required|exists:users,id',
            'answer' => 'required|array',
        ]);

        broadcast(new CallAccepted($request->caller_id, $request->answer))->toOthers();

        return response()->json(['status' => 'Call accepted']);
    }

    public function iceCandidate(Request $request)
    {
        $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'candidate' => 'required|array',
        ]);

        broadcast(new IceCandidateSent($request->to_user_id, $request->candidate))->toOthers();

        return response()->json(['status' => 'ICE candidate sent']);
    }
}
