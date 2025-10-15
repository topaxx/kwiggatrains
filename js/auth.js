// Authentication Functions

async function initAuthentication() {
    try {
        // Initialize Auth0 Client
        auth0Client = await auth0.createAuth0Client({
            domain: 'dev-d2madmmyraemi5zr.us.auth0.com',  // Replace with your Auth0 domain (e.g., 'your-tenant.auth0.com')
            clientId: '0TuLbrEuL5humLnQC7rLn7eDGqIaxFiE',  // Replace with your Auth0 client ID
            authorizationParams: {
                redirect_uri: window.location.origin
            },
            cacheLocation: 'localstorage'
        });

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
    } catch (error) {
        console.error('Error initializing authentication:', error);
    }
}

async function handleTwitterLogin() {
    try {
        if (auth0Client) {
            // Redirect to Auth0 Universal Login
            await auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.location.origin
                }
            });
        } else {
            throw new Error('Auth0 client not initialized');
        }
    } catch (error) {
        console.error('Error during login:', error);
        console.log('Falling back to demo mode...');
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
        picture: 'https://via.placeholder.com/100/1DA1F2/ffffff?text=X',
        email: 'demo@twitter.com'
    };
    
    isAuthenticated = true;
    localStorage.setItem('yogaUser', JSON.stringify(currentUser));
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
