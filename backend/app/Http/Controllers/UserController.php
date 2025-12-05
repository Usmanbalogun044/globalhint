<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use \App\Traits\HandleFileUploads;

    public function show($username)
    {
        $user = User::where('username', $username)->firstOrFail();
        return response()->json($user->load(['profile'])->loadCount(['posts', 'followers', 'following']));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        // Validate request
        $data = $request->validate([
            'display_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'location' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:50',
            'pronouns' => 'nullable|string|max:50',
            'website_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'youtube_url' => 'nullable|url|max:255',
            'tiktok_url' => 'nullable|url|max:255',
            'facebook_url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'dribbble_url' => 'nullable|url|max:255',
            'behance_url' => 'nullable|url|max:255',
            'snapchat_url' => 'nullable|url|max:255',
            'discord_url' => 'nullable|url|max:255',
            'telegram_url' => 'nullable|url|max:255',
            'whatsapp_number' => 'nullable|string|max:50',
            'profile_theme' => 'nullable|string|max:50',
            'is_business_account' => 'boolean',
            'is_private' => 'boolean',
            'visibility' => 'in:public,followers,private',
            'allow_messages_from' => 'in:everyone,followers,none',
            'email_public' => 'boolean',
            'phone_public' => 'boolean',
            'business_email' => 'nullable|email',
            'business_category' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|max:5120', // 5MB
            'banner' => 'nullable|image|max:10240', // 10MB
        ]);

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                $this->deleteFile($user->avatar);
            }
            $user->avatar = $this->uploadFile($request->file('avatar'), 'avatars');
            $user->save();
        }

        // Handle Banner Upload
        if ($request->hasFile('banner')) {
            // Delete old banner if exists
            if ($user->profile && $user->profile->banner_url) {
                $this->deleteFile($user->profile->banner_url);
            }
            $data['banner_url'] = $this->uploadFile($request->file('banner'), 'banners');
        }

        // Update User basic info
        if (isset($data['display_name'])) $user->name = $data['display_name'];
        if (isset($data['bio'])) $user->bio = $data['bio'];
        if (isset($data['location'])) $user->location = $data['location'];
        if (isset($data['website'])) $user->website = $data['website'];
        $user->save();

        // Remove fields that don't belong to the Profile model
        unset($data['bio']);
        unset($data['location']);
        unset($data['website']);
        unset($data['avatar']);
        unset($data['banner']);

        // Update or Create Profile
        $profile = $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('profile')
        ]);
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

    public function search(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([]);
        }

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($users);
    }
}
