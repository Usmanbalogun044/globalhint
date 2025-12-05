<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Post;
use App\Events\UserLocationUpdated;
use Illuminate\Support\Facades\Http;

class GlobalController extends Controller
{
    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'is_location_public' => 'boolean'
        ]);

        $user = $request->user();
        $user->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'is_location_public' => $request->is_location_public ?? $user->is_location_public
        ]);

        if ($user->is_location_public) {
            broadcast(new UserLocationUpdated($user))->toOthers();
        }

        return response()->json(['message' => 'Location updated']);
    }

    public function getMapData(Request $request)
    {
        // Get users who have public location enabled
        $users = User::where('is_location_public', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('id', 'name', 'username', 'avatar', 'latitude', 'longitude')
            ->get();

        // Get recent posts with location (if we add location to posts later)
        // For now, just return users
        
        return response()->json([
            'users' => $users,
            'posts' => [] 
        ]);
    }

    public function getNews(Request $request)
    {
        $apiKey = env('NEWS_API_KEY');
        if (!$apiKey) {
            return response()->json(['articles' => []]); // Return empty if no key
        }

        $category = $request->query('category', 'general');
        $country = $request->query('country', 'us');

        // Cache for 15 minutes
        $news = \Illuminate\Support\Facades\Cache::remember("news_{$country}_{$category}", 900, function () use ($apiKey, $country, $category) {
            try {
                $response = Http::get('https://newsapi.org/v2/top-headlines', [
                    'apiKey' => $apiKey,
                    'country' => $country,
                    'category' => $category,
                    'pageSize' => 5
                ]);
                return $response->json()['articles'] ?? [];
            } catch (\Exception $e) {
                return [];
            }
        });

        return response()->json($news);
    }

    public function getWeather(Request $request)
    {
        $apiKey = env('OPENWEATHER_API_KEY');
        if (!$apiKey) {
             return response()->json(null);
        }

        $lat = $request->query('lat');
        $lon = $request->query('lon');

        if (!$lat || !$lon) {
            $lat = 40.7128; // Default NYC
            $lon = -74.0060;
        }

        // Cache for 30 minutes
        $weather = \Illuminate\Support\Facades\Cache::remember("weather_{$lat}_{$lon}", 1800, function () use ($apiKey, $lat, $lon) {
            try {
                $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
                    'lat' => $lat,
                    'lon' => $lon,
                    'appid' => $apiKey,
                    'units' => 'metric'
                ]);
                
                $data = $response->json();
                
                if (isset($data['cod']) && $data['cod'] != 200) {
                    return null;
                }

                return [
                    'temp' => round($data['main']['temp'] ?? 0),
                    'condition' => $data['weather'][0]['main'] ?? 'Unknown',
                    'location' => $data['name'] ?? 'Unknown Location',
                    'icon' => $data['weather'][0]['icon'] ?? null
                ];
            } catch (\Exception $e) {
                return null;
            }
        });

        return response()->json($weather);
    }
}
