const API_URL = 'http://backend.test/api';

async function handleAuth(endpoint, data) {
    // Clear previous errors
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) errorContainer.remove();
    const form = document.querySelector('form');

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Server Error:', result); // Log full error to console
            
            let errorMessage = result.message || 'Something went wrong';
            
            // Handle validation errors
            if (result.errors) {
                errorMessage = Object.values(result.errors).flat().join('<br>');
            }

            throw new Error(errorMessage);
        }

        localStorage.setItem('token', result.access_token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Auth Error:', error);
        
        // Display error in UI
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorContainer';
        errorDiv.className = 'bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-4 text-sm text-center';
        errorDiv.innerHTML = error.message;
        
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        } else {
            alert(error.message); // Fallback
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            handleAuth('login', { email, password });
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirmation = document.getElementById('password_confirmation').value;

            handleAuth('register', { name, username, email, password, password_confirmation });
        });
    }
});
