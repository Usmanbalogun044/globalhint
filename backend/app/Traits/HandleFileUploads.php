<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandleFileUploads
{
    /**
     * Upload a file to the specified path and return a public URL.
     *
     * @param UploadedFile $file
     * @param string $path
     * @param string $disk
     * @return string
     */
    public function uploadFile(UploadedFile $file, string $path = 'uploads', string $disk = 'public')
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $storedPath = $file->storeAs($path, $filename, $disk);
        $url = Storage::disk($disk)->url($storedPath);
        
        // Replace localhost with the APP_URL if set (for production domains)
        $appUrl = env('APP_URL');
        if ($appUrl && Str::startsWith($url, 'http://localhost')) {
            $url = str_replace('http://localhost', rtrim($appUrl, '/'), $url);
        }
        return $url;
    }

    /**
     * Delete a file from storage using its URL or path.
     *
     * @param string|null $url
     * @param string $disk
     * @return bool
     */
    public function deleteFile(?string $url, string $disk = 'public'): bool
    {
        if (!$url) {
            return false;
        }

        // Parse path from URL
        $path = parse_url($url, PHP_URL_PATH);
        
        // Remove leading slash
        $path = ltrim($path, '/');
        
        // Remove 'storage/' prefix if present (common for public disk links)
        if (Str::startsWith($path, 'storage/')) {
            $path = Str::replaceFirst('storage/', '', $path);
        }

        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }
}
