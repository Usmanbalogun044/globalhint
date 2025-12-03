const AuthModals = {
    init() {
        this.injectModals();
        this.attachEventListeners();
    },

    injectModals() {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'authModals';
        modalContainer.className = 'relative z-50 hidden';
        modalContainer.innerHTML = `
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity opacity-0" id="modalBackdrop"></div>

            <!-- Login Modal -->
            <div class="fixed inset-0 flex items-center justify-center p-4 opacity-0 scale-95 transition-all pointer-events-none" id="loginModal">
                <div class="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                    <button class="absolute top-4 right-4 text-gray-400 hover:text-white transition" onclick="AuthModals.closeAll()">✕</button>
                    
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                            <span class="text-3xl font-bold text-white">G</span>
                        </div>
                        <h2 class="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p class="text-gray-400">Enter your details to access your account</p>
                    </div>

                    <form id="modalLoginForm" class="space-y-5">
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-300 ml-1">Email</label>
                            <input type="email" id="modalLoginEmail" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="name@example.com" required>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <input type="password" id="modalLoginPassword" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" placeholder="••••••••" required>
                        </div>
                        
                        <div class="flex items-center justify-between text-sm">
                            <label class="flex items-center text-gray-400 cursor-pointer hover:text-gray-300">
                                <input type="checkbox" class="mr-2 rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500"> Remember me
                            </label>
                            <a href="#" class="text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                        </div>

                        <button type="submit" class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition transform hover:scale-[1.02] active:scale-95">
                            Sign In
                        </button>
                    </form>

                    <div class="mt-8 text-center text-gray-400 text-sm">
                        Don't have an account? 
                        <button onclick="AuthModals.switch('register')" class="text-white font-bold hover:underline">Sign up</button>
                    </div>
                </div>
            </div>

            <!-- Register Modal -->
            <div class="fixed inset-0 flex items-center justify-center p-4 opacity-0 scale-95 transition-all pointer-events-none" id="registerModal">
                <div class="glass-panel w-full max-w-md p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-purple-500/20">
                    <button class="absolute top-4 right-4 text-gray-400 hover:text-white transition" onclick="AuthModals.closeAll()">✕</button>
                    
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-white mb-2">Create Account</h2>
                        <p class="text-gray-400">Join the Globalhint community today</p>
                    </div>

                    <form id="modalRegisterForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Name</label>
                                <input type="text" id="modalRegName" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="John Doe" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold text-gray-400 uppercase ml-1">Username</label>
                                <input type="text" id="modalRegUsername" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="@john" required>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                            <input type="email" id="modalRegEmail" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="name@example.com" required>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Password</label>
                            <input type="password" id="modalRegPassword" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="••••••••" required>
                        </div>

                        <div class="space-y-2">
                            <label class="text-xs font-bold text-gray-400 uppercase ml-1">Confirm Password</label>
                            <input type="password" id="modalRegConfirm" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition" placeholder="••••••••" required>
                        </div>

                        <button type="submit" class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/25 transition transform hover:scale-[1.02] active:scale-95 mt-2">
                            Create Account
                        </button>
                    </form>

                    <div class="mt-6 text-center text-gray-400 text-sm">
                        Already have an account? 
                        <button onclick="AuthModals.switch('login')" class="text-white font-bold hover:underline">Sign in</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
    },

    attachEventListeners() {
        // Login Form
        document.getElementById('modalLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('modalLoginEmail').value;
            const password = document.getElementById('modalLoginPassword').value;
            handleAuth('login', { email, password }, document.getElementById('modalLoginForm'));
        });

        // Register Form
        document.getElementById('modalRegisterForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('modalRegName').value;
            const username = document.getElementById('modalRegUsername').value;
            const email = document.getElementById('modalRegEmail').value;
            const password = document.getElementById('modalRegPassword').value;
            const password_confirmation = document.getElementById('modalRegConfirm').value;

            handleAuth('register', { name, username, email, password, password_confirmation }, document.getElementById('modalRegisterForm'));
        });

        // Close on backdrop click
        document.getElementById('modalBackdrop').addEventListener('click', () => {
            this.closeAll();
        });
    },

    open(type = 'login') {
        const container = document.getElementById('authModals');
        const backdrop = document.getElementById('modalBackdrop');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');

        container.classList.remove('hidden');

        // Animate in backdrop
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
        }, 10);

        // Reset modals
        loginModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        registerModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');

        // Show target modal
        const target = type === 'login' ? loginModal : registerModal;
        setTimeout(() => {
            target.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        }, 50);
    },

    closeAll() {
        const container = document.getElementById('authModals');
        const backdrop = document.getElementById('modalBackdrop');
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');

        backdrop.classList.add('opacity-0');
        loginModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        registerModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');

        setTimeout(() => {
            container.classList.add('hidden');
        }, 300);
    },

    switch(type) {
        const loginModal = document.getElementById('loginModal');
        const registerModal = document.getElementById('registerModal');

        if (type === 'register') {
            loginModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => {
                registerModal.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            }, 200);
        } else {
            registerModal.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            setTimeout(() => {
                loginModal.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            }, 200);
        }
    }
};
