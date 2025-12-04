<?php

use App\Models\User;
use App\Models\Notification;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = User::first();
if (!$user) {
    echo "No user found.\n";
    exit;
}

echo "User ID: " . $user->id . "\n";

$n = Notification::create([
    'user_id' => $user->id,
    'type' => 'vote',
    'data' => ['sender_name' => 'System Test', 'type' => 'vote', 'vote_type' => 'up', 'post_id' => 1],
    'read_at' => null
]);

echo "Created Notification ID: " . $n->id . "\n";

$count = $user->notifications()->count();
echo "Total Notifications for User: " . $count . "\n";

$latest = $user->notifications()->latest()->first();
echo "Latest Notification Type: " . $latest->type . "\n";
