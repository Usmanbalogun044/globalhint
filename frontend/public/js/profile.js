// Ensure API_URL is available
if (typeof API_URL === 'undefined') {
    var API_URL = 'https://backend.test/api';
}

async function fetchProfile(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}`);
        const user = await response.json();

        // Get current logged in user
        const currentUserStr = localStorage.getItem('user');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        const isOwnProfile = currentUser && currentUser.id === user.id;

        const header = document.getElementById('profileHeader');
        if (header) {
            // Random gradient for cover if no cover image
            const gradients = [
                'from-indigo-600 to-purple-600',
                'from-blue-600 to-cyan-600',
                'from-fuchsia-600 to-pink-600',
                'from-orange-500 to-red-600'
            ];
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

            header.innerHTML = `
                <div class="relative group">
                    <div class="h-64 bg-gradient-to-r ${randomGradient} relative overflow-hidden">
                        <div class="absolute inset-0 bg-black/10"></div>
                        <!-- Cover Image Placeholder or Real Image -->
                        ${user.cover_url ? `<img src="${user.cover_url}" class="w-full h-full object-cover">` : ''}
                        
                        ${isOwnProfile ? `
                            <button class="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition opacity-0 group-hover:opacity-100">
                                📷 <span class="text-sm font-medium ml-2">Edit Cover</span>
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="absolute -bottom-16 left-8">
                        <div class="relative">
                            <div class="w-36 h-36 rounded-full ring-4 ring-[#0f0f12] overflow-hidden bg-[#0f0f12] shadow-2xl">
                                ${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">👤</div>'}
                            </div>
                            ${isOwnProfile ? `
                                <button class="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 ring-4 ring-[#0f0f12] transition shadow-lg">
                                    📷
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="pt-20 px-8 pb-8">
                    <div class="flex justify-between items-start">
                        <div>
                            <h1 class="text-4xl font-bold text-white tracking-tight">${user.name}</h1>
                            <div class="text-gray-400 text-lg">@${user.username}</div>
                            
                            <div class="flex items-center space-x-4 mt-3 text-gray-400 text-sm">
                                <div class="flex items-center">
                                    <span class="mr-1">📅</span> Joined ${new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </div>
                                <div class="flex items-center">
                                    <span class="mr-1">📍</span> ${user.location || 'Global'}
                                </div>
                            </div>
                        </div>

                        <div class="flex space-x-3">
                            ${isOwnProfile ? `
                                <button class="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-full backdrop-blur-md transition border border-white/10">
                                    Edit Profile
                                </button>
                            ` : `
                                <button class="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full backdrop-blur-md transition border border-white/10" title="Message">
                                    💬
                                </button>
                                <button class="bg-white text-black font-bold py-2.5 px-8 rounded-full hover:bg-indigo-50 transition shadow-lg shadow-indigo-500/20" onclick="alert('Follow logic here')">
                                    Follow
                                </button>
                            `}
                        </div>
                    </div>
                    
                    <p class="mt-6 text-gray-200 max-w-2xl leading-relaxed text-lg">${user.bio || 'No bio yet.'}</p>
                    
                    <!-- Stats Cards -->
                    <div class="grid grid-cols-3 gap-4 mt-8 max-w-lg">
                        <div class="glass-panel rounded-xl p-4 text-center hover:bg-white/5 transition cursor-pointer border border-white/5">
                            <div class="font-bold text-2xl text-white">${user.following_count || 0}</div>
                            <div class="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">Following</div>
                        </div>
                        <div class="glass-panel rounded-xl p-4 text-center hover:bg-white/5 transition cursor-pointer border border-white/5">
                            <div class="font-bold text-2xl text-white">${user.followers_count || 0}</div>
                            <div class="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">Followers</div>
                        </div>
                        <div class="glass-panel rounded-xl p-4 text-center hover:bg-white/5 transition cursor-pointer border border-white/5">
                            <div class="font-bold text-2xl text-white">${user.posts_count || 0}</div>
                            <div class="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">Posts</div>
                        </div>
                    </div>
                    
                    <!-- Tabs -->
                    <div class="flex space-x-8 mt-10 border-b border-gray-700/50">
                        <button class="pb-4 border-b-2 border-indigo-500 text-white font-bold px-2">Posts</button>
                        <button class="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-300 transition px-2">Replies</button>
                        <button class="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-300 transition px-2">Media</button>
                        <button class="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-300 transition px-2">Likes</button>
                    </div>
                </div>
            `;
        }

        // Fetch user posts
        const postsResponse = await fetch(`${API_URL}/posts?user_id=${userId}`);
        const postsData = await postsResponse.json();
        renderPosts(postsData.data || postsData);

    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}
