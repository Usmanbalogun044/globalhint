const API_URL = 'https://backend.test/api';
const token = localStorage.getItem('token');

function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function fetchPosts() {
    try {
        const headers = {
            'Accept': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/posts`, { headers });

        if (response.status === 401) {
            localStorage.removeItem('token');
            return;
        }

        const data = await response.json();
        renderPosts(data.data);
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

function renderPosts(posts) {
    const feed = document.getElementById('feed');
    feed.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'glass-panel rounded-2xl p-5 hover:bg-white/5 transition cursor-pointer border-transparent hover:border-white/10';
        postElement.innerHTML = `
            <div class="flex space-x-4">
                <div class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-indigo-500/30 cursor-pointer" onclick="event.stopPropagation(); window.location.href='profile.html?id=${post.user.id}'">
                    ${post.user.avatar ? `<img src="${post.user.avatar}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-700"></div>'}
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 cursor-pointer" onclick="event.stopPropagation(); window.location.href='profile.html?id=${post.user.id}'">
                            <span class="font-bold text-white text-lg hover:text-indigo-400 transition">${post.user.name}</span>
                            <span class="text-gray-400 text-sm">@${post.user.username}</span>
                        </div>
                        <span class="text-gray-500 text-xs">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <p class="mt-3 text-gray-200 text-lg leading-relaxed">${post.content || ''}</p>
                    
                    ${post.media_url ? renderMedia(post) : ''}
                    
                    <div class="flex items-center justify-between text-gray-400 mt-5 pt-4 border-t border-gray-700/30">
                        <button class="hover:text-indigo-400 flex items-center space-x-2 group transition">
                            <span class="group-hover:bg-indigo-500/10 p-2 rounded-lg transition">💬</span>
                            <span class="text-sm">0</span>
                        </button>
                        <button class="hover:text-green-400 flex items-center space-x-2 group transition">
                            <span class="group-hover:bg-green-500/10 p-2 rounded-lg transition">🔁</span>
                            <span class="text-sm">0</span>
                        </button>
                        <button class="hover:text-pink-500 flex items-center space-x-2 group transition" onclick="votePost(${post.id}, true)">
                            <span class="group-hover:bg-pink-500/10 p-2 rounded-lg transition">❤️</span>
                            <span class="text-sm">${post.votes_count || 0}</span>
                        </button>
                        <button class="hover:text-indigo-400 flex items-center space-x-2 group transition">
                            <span class="group-hover:bg-indigo-500/10 p-2 rounded-lg transition">📊</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        feed.appendChild(postElement);
    });
}

function renderMedia(post) {
    if (post.type === 'image') {
        return `<img src="${post.media_url}" class="mt-3 rounded-2xl border border-gray-800 max-h-96 w-full object-cover">`;
    } else if (post.type === 'video') {
        return `<video src="${post.media_url}" controls class="mt-3 rounded-2xl border border-gray-800 w-full"></video>`;
    }
    return '';
}

async function createPost() {
    if (!checkAuth()) return;

    const content = document.querySelector('textarea').value;
    if (!content) return;

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                content,
                type: 'text' // Default for now
            })
        });

        if (response.ok) {
            document.querySelector('textarea').value = '';
            fetchPosts(); // Refresh feed
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
}



function votePost(postId, isUpvote) {
    if (!checkAuth()) return;
    // Implement vote logic here (placeholder)
    console.log('Voting on', postId);
}

function updateUI() {
    const authLinks = document.getElementById('authLinks');
    const sidebarPostBtn = document.getElementById('sidebarPostBtn');
    const inputArea = document.querySelector('.glass-panel.rounded-2xl.p-4.mb-6'); // Post input area

    if (token) {
        // Logged In
        authLinks.innerHTML = `
            <a href="#" class="flex items-center space-x-4 p-3 rounded-xl text-gray-400 hover:text-white font-medium transition-all hover:bg-white/5">
                <span class="text-xl">🔔</span> <span class="hidden lg:block">Notifications</span>
            </a>
            <a href="#" class="flex items-center space-x-4 p-3 rounded-xl text-gray-400 hover:text-white font-medium transition-all hover:bg-white/5">
                <span class="text-xl">👤</span> <span class="hidden lg:block">Profile</span>
            </a>
            <button onclick="logout()" class="flex items-center space-x-4 p-3 rounded-xl text-red-400 hover:text-red-300 font-medium transition-all hover:bg-red-500/10 w-full text-left">
                <span class="text-xl">🚪</span> <span class="hidden lg:block">Logout</span>
            </button>
        `;
        if (sidebarPostBtn) sidebarPostBtn.style.display = 'flex';
        if (inputArea) inputArea.style.display = 'block';
    } else {
        // Guest
    } else {
        // Guest
        authLinks.innerHTML = `
            <a href="login.html" class="flex items-center space-x-4 p-3 rounded-xl text-indigo-400 hover:text-indigo-300 font-medium transition-all hover:bg-indigo-500/10">
                <span class="text-xl">🔐</span> <span class="hidden lg:block">Login</span>
            </a>
            <a href="register.html" class="flex items-center space-x-4 p-3 rounded-xl text-indigo-400 hover:text-indigo-300 font-medium transition-all hover:bg-indigo-500/10">
                <span class="text-xl">📝</span> <span class="hidden lg:block">Sign Up</span>
            </a>
        `;
        if (sidebarPostBtn) sidebarPostBtn.style.display = 'none';

        // Show input area for guests but make it trigger login
        if (inputArea) {
            inputArea.style.display = 'block';
            const textarea = inputArea.querySelector('textarea');
            const buttons = inputArea.querySelectorAll('button');

            const redirectToLogin = () => {
                window.location.href = 'login.html';
            };

            if (textarea) {
                textarea.addEventListener('click', redirectToLogin);
                textarea.addEventListener('focus', redirectToLogin);
            }

            buttons.forEach(btn => {
                btn.addEventListener('click', redirectToLogin);
            });
        }
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Check if we are on profile page
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    if (profileId) {
        fetchProfile(profileId);
    } else {
        fetchPosts();
    }

    fetchWhoToFollow();

    const postBtn = document.querySelector('button.bg-white.text-black'); // The one in the input area
    if (postBtn) {
        postBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        postBtn.addEventListener('click', createPost);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
});

async function performSearch(query) {
    if (!query.trim()) {
        fetchPosts(); // Reset to normal feed if empty
        return;
    }

    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderSearchResults(data);
    } catch (error) {
        console.error('Error searching:', error);
    }
}

function renderSearchResults(data) {
    const feed = document.getElementById('feed');
    feed.innerHTML = `<h2 class="text-xl font-bold mb-4 px-2">Search Results</h2>`;

    if (data.users.length > 0) {
        feed.innerHTML += `<h3 class="text-lg font-semibold text-gray-400 mb-2 px-2">People</h3>`;
        data.users.forEach(user => {
            feed.innerHTML += `
                <div class="glass-panel rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition" onclick="window.location.href='profile.html?id=${user.id}'">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
                            ${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-700"></div>'}
                        </div>
                        <div>
                            <div class="font-bold text-white">${user.name}</div>
                            <div class="text-sm text-gray-500">@${user.username}</div>
                        </div>
                    </div>
                    <button class="bg-white text-black text-sm font-bold py-1.5 px-4 rounded-lg hover:bg-indigo-50 transition">View</button>
                </div>
            `;
        });
    }

    if (data.posts.length > 0) {
        feed.innerHTML += `<h3 class="text-lg font-semibold text-gray-400 mb-2 mt-6 px-2">Posts</h3>`;
        // Reuse renderPosts logic but append instead of clear
        const postsContainer = document.createElement('div');
        postsContainer.className = 'space-y-6';
        feed.appendChild(postsContainer);

        data.posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'glass-panel rounded-2xl p-5 hover:bg-white/5 transition cursor-pointer border-transparent hover:border-white/10';
            postElement.innerHTML = `
                <div class="flex space-x-4">
                    <div class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-indigo-500/30">
                        ${post.user.avatar ? `<img src="${post.user.avatar}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-700"></div>'}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                                <span class="font-bold text-white text-lg">${post.user.name}</span>
                                <span class="text-gray-400 text-sm">@${post.user.username}</span>
                            </div>
                            <span class="text-gray-500 text-xs">${new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <p class="mt-3 text-gray-200 text-lg leading-relaxed">${post.content || ''}</p>
                        
                        ${post.media_url ? renderMedia(post) : ''}
                        
                        <div class="flex items-center justify-between text-gray-400 mt-5 pt-4 border-t border-gray-700/30">
                            <button class="hover:text-indigo-400 flex items-center space-x-2 group transition">
                                <span class="group-hover:bg-indigo-500/10 p-2 rounded-lg transition">💬</span>
                                <span class="text-sm">0</span>
                            </button>
                            <button class="hover:text-green-400 flex items-center space-x-2 group transition">
                                <span class="group-hover:bg-green-500/10 p-2 rounded-lg transition">🔁</span>
                                <span class="text-sm">0</span>
                            </button>
                            <button class="hover:text-pink-500 flex items-center space-x-2 group transition" onclick="votePost(${post.id}, true)">
                                <span class="group-hover:bg-pink-500/10 p-2 rounded-lg transition">❤️</span>
                                <span class="text-sm">${post.votes_count || 0}</span>
                            </button>
                            <button class="hover:text-indigo-400 flex items-center space-x-2 group transition">
                                <span class="group-hover:bg-indigo-500/10 p-2 rounded-lg transition">📊</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    }

    if (data.users.length === 0 && data.posts.length === 0) {
        feed.innerHTML += `<p class="text-gray-500 text-center mt-10">No results found for "${searchInput.value}"</p>`;
    }
}

async function fetchWhoToFollow() {
    try {
        const response = await fetch(`${API_URL}/users/suggested`);
        const data = await response.json();
        renderWhoToFollow(data.data);
    } catch (error) {
        console.error('Error fetching suggested users:', error);
    }
}

function renderWhoToFollow(users) {
    const container = document.querySelector('aside.hidden.xl\\:block .space-y-5');
    if (!container) return;

    // Keep existing trending topics or clear? Let's append or replace.
    // For now, let's add a header and list.

    const whoToFollowHTML = `
        <div class="mt-8">
            <h3 class="font-bold text-xl mb-6 gradient-text">Who to follow</h3>
            <div class="space-y-4">
                ${users.map(user => `
                    <div class="flex items-center justify-between group cursor-pointer" onclick="window.location.href='profile.html?id=${user.id}'">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
                                ${user.avatar ? `<img src="${user.avatar}" class="w-full h-full object-cover">` : '<div class="w-full h-full bg-gray-700"></div>'}
                            </div>
                            <div>
                                <div class="font-bold text-sm group-hover:text-indigo-400 transition">${user.name}</div>
                                <div class="text-xs text-gray-500">@${user.username}</div>
                            </div>
                        </div>
                        <button class="bg-white text-black text-xs font-bold py-1.5 px-4 rounded-lg hover:bg-indigo-50 transition">Follow</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    container.parentElement.insertAdjacentHTML('beforeend', whoToFollowHTML);

    // Add event listeners to new follow buttons
    const followBtns = container.parentElement.querySelectorAll('button.bg-white');
    followBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent row click
            if (!checkAuth()) return;
            // Implement follow logic here
            console.log('Follow clicked');
        });
    });
}
