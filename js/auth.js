// Authentication Functions

async function initAuthentication() {
    console.log('Initializing authentication...');
    console.log('Auth0 library available:', typeof auth0 !== 'undefined');
    console.log('Window location:', window.location.origin);
    
    // Check if Auth0 library is loaded and has the createAuth0Client method
    if (typeof auth0 === 'undefined' || typeof auth0.createAuth0Client !== 'function') {
        console.error('Auth0 library not properly loaded - using demo mode immediately');
        console.log('Auth0 object:', typeof auth0);
        console.log('createAuth0Client method:', typeof auth0?.createAuth0Client);
        console.log('Using demo mode');
        auth0Client = null;
        isAuthenticated = false;
        currentUser = null;
        return;
    }
    
    // Try Auth0 initialization with retry logic
    const maxRetries = 2;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Auth0 initialization attempt ${attempt}/${maxRetries}`);
            await initializeAuth0Client();
            return; // Success, exit function
        } catch (error) {
            console.log(`Auth0 attempt ${attempt} failed:`, error.message);
            lastError = error;
            if (attempt < maxRetries) {
                console.log('Retrying Auth0 initialization in 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    // All attempts failed, use demo mode
    console.log('All Auth0 initialization attempts failed, using demo mode');
    console.log('Final error:', lastError?.message);
    auth0Client = null;
    isAuthenticated = false;
    currentUser = null;
}

async function initializeAuth0Client() {
    
    // Initialize Auth0 Client with timeout
    console.log('Creating Auth0 client...');
    console.log('Domain:', 'dev-d2madmmyraemi5zr.us.auth0.com');
    console.log('Client ID:', '0TuLbrEuL5humLnQC7rLn7eDGqIaxFiE');
    
    const auth0Promise = auth0.createAuth0Client({
        domain: 'dev-d2madmmyraemi5zr.us.auth0.com',
        clientId: '0TuLbrEuL5humLnQC7rLn7eDGqIaxFiE',
        authorizationParams: {
            redirect_uri: window.location.origin,
            scope: 'openid profile email'
        },
        cacheLocation: 'localstorage',
        useRefreshTokens: true,
        useFormData: false
    });
    
    // Add timeout to Auth0 initialization (increased to 5s for better reliability)
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth0 initialization timeout')), 5000);
    });
    
    console.log('Starting Auth0 client creation with 5s timeout...');
    console.log('Network status:', navigator.onLine);
    console.log('Current URL:', window.location.href);
    
    auth0Client = await Promise.race([auth0Promise, timeoutPromise]);
    console.log('Auth0 client created successfully');

        // Check if we're returning from Auth0 login
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            try {
                await auth0Client.handleRedirectCallback();
                // Clean up the URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error handling redirect callback:', error);
            }
        }

        // Check if user is authenticated
        isAuthenticated = await auth0Client.isAuthenticated();

        if (isAuthenticated) {
            currentUser = await auth0Client.getUser();
            console.log('User authenticated:', currentUser);
            
            // Store user in localStorage for persistence
            localStorage.setItem('yogaUser', JSON.stringify(currentUser));
            
            // Subscribe to real-time updates
            subscribeToTrainings();
            
            // Show user ID modal (commented out for now)
            // setTimeout(() => {
            //     showUseridModal();
            // }, 500);
        } else {
            // Check localStorage for cached user
            const cachedUser = localStorage.getItem('yogaUser');
            if (cachedUser) {
                try {
                    currentUser = JSON.parse(cachedUser);
                    isAuthenticated = true;
                    console.log('User restored from cache:', currentUser);
                } catch (error) {
                    console.error('Error parsing cached user:', error);
                    localStorage.removeItem('yogaUser');
                }
            }
        }
}

async function handleTwitterLogin() {
    console.log('handleTwitterLogin called');
    console.log('Auth0 client available:', !!auth0Client);
    
    // Show loading indicator
    const loginBtn = document.getElementById('settings-twitter-login-btn');
    const loadingIndicator = document.getElementById('settings-login-loading');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    
    // If Auth0 client is not available, go directly to demo mode
    if (!auth0Client) {
        console.log('Auth0 client not available, using demo mode');
        // Hide loading and show login button again
        if (loginBtn) loginBtn.style.display = 'block';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        simulateTwitterLogin();
        return;
    }
    
    try {
        console.log('Attempting Auth0 login...');
        // Redirect to Auth0 Universal Login
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        console.log('Falling back to demo mode...');
        // Hide loading and show login button again
        if (loginBtn) loginBtn.style.display = 'block';
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        // Fallback for demo purposes - simulate login
        simulateTwitterLogin();
    }
}

function simulateTwitterLogin() {
    // Demo function for testing without actual Auth0 setup
    currentUser = {
        sub: 'twitter|demo_123',
        nickname: 'demo_user',
        name: 'Demo Twitter User',
        picture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMUQ5MUYyIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjUgODBMMzUgNzBINjVMMzUgODBIMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
        email: 'demo@twitter.com'
    };
    
    isAuthenticated = true;
    localStorage.setItem('yogaUser', JSON.stringify(currentUser));
    
    // Hide loading indicator and show login button
    const loginBtn = document.getElementById('settings-twitter-login-btn');
    const loadingIndicator = document.getElementById('settings-login-loading');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    
    // Update UI to show logged in state
    updateSettingsAuthUI();
    hideUserModal();
    
    console.log('Demo Twitter user logged in:', currentUser);
}

async function handleLogout() {
    try {
        if (auth0Client) {
            // Logout from Auth0
            await auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
    
    // Clear local state
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('yogaUser');
    hideUserModal();
    
    console.log('User logged out');
    
    // Show logout success modal
    showLogoutSuccessModal();
}

// User modal functions
function showUserModal() {
    if (isAuthenticated) {
        showUserInfo();
    } else {
        showLoginForm();
    }
    userModal.classList.add('active');
}

function hideUserModal() {
    userModal.classList.remove('active');
}

function showLoginForm() {
    userModalTitle.textContent = 'Login';
    loginContent.style.display = 'block';
    userContent.style.display = 'none';
}

function showUserInfo() {
    userModalTitle.textContent = 'Account';
    loginContent.style.display = 'none';
    userContent.style.display = 'block';
    
    if (currentUser) {
        const displayName = currentUser.name || currentUser.nickname || 'User';
        userAvatarImg.src = currentUser.picture || '';
        userAvatarImg.alt = displayName;
        userName.textContent = displayName;
        userEmail.textContent = currentUser.email || '';
    }
}

function updateSettingsAuthUI() {
    if (currentUser) {
        // User is logged in, show user info
        settingsLoginContent.style.display = 'none';
        settingsUserContent.style.display = 'block';
        
        // Show logout button in header
        const settingsLogoutBtn = document.getElementById('settings-logout-btn');
        settingsLogoutBtn.style.display = 'flex';
        
        const displayName = currentUser.name || currentUser.nickname || 'User';
        settingsUserAvatarImg.src = currentUser.picture || '';
        settingsUserAvatarImg.alt = displayName;
        settingsUserName.textContent = displayName;
        settingsUserEmail.textContent = currentUser.email || '';
    } else {
        // User is not logged in, show login form
        settingsLoginContent.style.display = 'block';
        settingsUserContent.style.display = 'none';
        
        // Hide logout button in header
        const settingsLogoutBtn = document.getElementById('settings-logout-btn');
        settingsLogoutBtn.style.display = 'none';
    }
}

function showUseridModal() {
    if (currentUser) {
        const displayName = currentUser.name || currentUser.nickname || 'User';
        
        // Update modal content
        useridAvatarImg.src = currentUser.picture || '';
        useridAvatarImg.alt = displayName;
        useridName.textContent = displayName;
        useridEmail.textContent = currentUser.email || '';
        useridDisplay.textContent = currentUser.sub || 'No ID available';
        
        // Show modal
        useridModal.classList.add('active');
    }
}

function hideUseridModal() {
    useridModal.classList.remove('active');
}

// Logout success modal functions
function showLogoutSuccessModal() {
    logoutSuccessModal.classList.add('active');
}

function hideLogoutSuccessModal() {
    logoutSuccessModal.classList.remove('active');
    // Navigate to main screen after modal is closed
    showMainScreen();
}
