<?php

$pdo = new PDO('sqlite:' . __DIR__ . '/backend/database/database.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$commands = [
    "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        avatar VARCHAR(255),
        bio TEXT,
        email_verified_at DATETIME,
        password VARCHAR(255) NOT NULL,
        remember_token VARCHAR(100),
        created_at DATETIME,
        updated_at DATETIME
    )",
    "CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME,
        updated_at DATETIME
    )",
    "CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        content TEXT,
        type VARCHAR(255) DEFAULT 'text',
        media_url VARCHAR(255),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )",
    "CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        type VARCHAR(255) DEFAULT 'follow',
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(follower_id, following_id)
    )",
    "CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        is_upvote BOOLEAN DEFAULT 1,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id)
    )",
    "CREATE TABLE IF NOT EXISTS personal_access_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tokenable_type VARCHAR(255) NOT NULL,
        tokenable_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        abilities TEXT,
        last_used_at DATETIME,
        expires_at DATETIME,
        created_at DATETIME,
        updated_at DATETIME
    )"
];

foreach ($commands as $sql) {
    try {
        $pdo->exec($sql);
        echo "Executed: " . substr($sql, 0, 50) . "...\n";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

echo "Migration complete.\n";
