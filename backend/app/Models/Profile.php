<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'birth_date',
        'gender',
        'pronouns',
        'website_url',
        'banner_url',
        'profile_theme',
        'highlight_banner_url',
        'linkedin_url',
        'instagram_url',
        'twitter_url',
        'youtube_url',
        'tiktok_url',
        'facebook_url',
        'github_url',
        'dribbble_url',
        'behance_url',
        'snapchat_url',
        'discord_url',
        'telegram_url',
        'whatsapp_number',
        'is_verified',
        'verified_at',
        'verification_type',
        'is_business_account',
        'is_private',
        'visibility',
        'safety_score',
        'badges',
        'role_tags',
        'interests',
        'topics_followed',
        'ai_embedding_vector',
        'language_preference',
        'profile_view_count',
        'profile_engagement_score',
        'last_seen_at',
        'device_last_used',
        'ip_last_login',
        'is_premium',
        'premium_since',
        'payout_enabled',
        'payout_account_id',
        'monetization_score',
        'allow_messages_from',
        'allow_mentions_from',
        'block_suggestions',
        'muted_words',
        'blocked_users_count',
        'email_public',
        'phone_public',
        'business_email',
        'business_category',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'premium_since' => 'datetime',
        'is_verified' => 'boolean',
        'is_business_account' => 'boolean',
        'is_private' => 'boolean',
        'is_premium' => 'boolean',
        'payout_enabled' => 'boolean',
        'block_suggestions' => 'boolean',
        'email_public' => 'boolean',
        'phone_public' => 'boolean',
        'badges' => 'array',
        'role_tags' => 'array',
        'interests' => 'array',
        'topics_followed' => 'array',
        'ai_embedding_vector' => 'array',
        'muted_words' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
