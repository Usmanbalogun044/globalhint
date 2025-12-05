<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Identity & Personal Info
            $table->string('display_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('pronouns')->nullable();
            $table->string('website_url')->nullable();
            
            // Profile Media
            $table->string('banner_url')->nullable();
            $table->string('profile_theme')->nullable(); // hex color or theme name
            $table->string('highlight_banner_url')->nullable();

            // Social Links
            $table->string('linkedin_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('dribbble_url')->nullable();
            $table->string('behance_url')->nullable();
            $table->string('snapchat_url')->nullable();
            $table->string('discord_url')->nullable();
            $table->string('telegram_url')->nullable();
            $table->string('whatsapp_number')->nullable();

            // Profile Status & Safety
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_type')->nullable(); // government, paid, organization
            $table->boolean('is_business_account')->default(false);
            $table->boolean('is_private')->default(false);
            $table->string('visibility')->default('public'); // public, followers, private
            $table->integer('safety_score')->default(100);

            // Badges & Metadata
            $table->json('badges')->nullable(); // ['verified', 'founder', 'artist']
            $table->json('role_tags')->nullable(); // ['moderator', 'staff']

            // Personalization & AI
            $table->json('interests')->nullable();
            $table->json('topics_followed')->nullable();
            $table->json('ai_embedding_vector')->nullable(); // For vector search/recommendations
            $table->string('language_preference')->default('en');

            // Profile Statistics (Cached/Counters)
            $table->unsignedBigInteger('profile_view_count')->default(0);
            $table->integer('profile_engagement_score')->default(0);

            // Activity Tracking
            $table->timestamp('last_seen_at')->nullable();
            $table->string('device_last_used')->nullable();
            $table->string('ip_last_login')->nullable();

            // Monetization
            $table->boolean('is_premium')->default(false);
            $table->timestamp('premium_since')->nullable();
            $table->boolean('payout_enabled')->default(false);
            $table->string('payout_account_id')->nullable();
            $table->integer('monetization_score')->default(0);

            // Privacy & Messaging Controls
            $table->string('allow_messages_from')->default('everyone'); // everyone, followers, none
            $table->string('allow_mentions_from')->default('everyone');
            $table->boolean('block_suggestions')->default(false);
            $table->json('muted_words')->nullable();
            $table->integer('blocked_users_count')->default(0);

            // Contact & About Information
            $table->boolean('email_public')->default(false);
            $table->boolean('phone_public')->default(false);
            $table->string('business_email')->nullable();
            $table->string('business_category')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
