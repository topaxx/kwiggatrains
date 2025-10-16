// Main Application Bootstrap

// Initialize app
async function init() {
    initBellSound();
    initBowlSound();
    
    // Start Auth0 initialization in background (non-blocking)
    initAuthentication().catch(error => {
        console.log('Auth0 initialization failed, continuing with demo mode');
    });
    
    // Load the rest of the app immediately
    renderRoutines();
    renderPoses();
    renderActivities();
    renderExercises();
    setupEventListeners();
}

// Function to check if any modals are active and blocking interactions
function checkForActiveModals() {
    const modals = document.querySelectorAll('.modal.active');
    if (modals.length > 0) {
        console.log('Active modals found:', modals.length);
        modals.forEach(modal => {
            console.log('Active modal:', modal.id || modal.className);
        });
        return true;
    }
    return false;
}

// Event listeners
function setupEventListeners() {
    
    // Debug: Check if DOM elements exist
    console.log('DOM elements check:');
    console.log('- addRoutineBtn:', addRoutineBtn);
    console.log('- settingsBtn:', settingsBtn);
    console.log('- showHistoryBtn:', showHistoryBtn);
    
    // Debug: Check if functions are available
    console.log('Function availability check:');
    console.log('- showRoutineBuilder:', typeof showRoutineBuilder);
    console.log('- showSettingsScreen:', typeof showSettingsScreen);
    console.log('- showHistoryScreen:', typeof showHistoryScreen);
    
    addRoutineBtn.addEventListener('click', () => {
        console.log('Add Train button clicked');
        window.scrollTo(0, 0);
        showRoutineBuilder();
    });
    backFromBuilder.addEventListener('click', showMainScreen);
    backFromExecution.addEventListener('click', showMainScreen);
    // Use event delegation for Save Train button to ensure it works
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'save-routine-btn') {
            console.log('Save Train button clicked via delegation');
            if (checkForActiveModals()) {
                console.log('Modal is active, ignoring Save Train click');
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            saveRoutine();
        }
    });
    pauseResumeBtn.addEventListener('click', togglePause);
    nextPoseBtn.addEventListener('click', nextPose);
    previousPoseBtn.addEventListener('click', previousPose);
    
    // New event listeners for step-by-step flow
    nextToPosesBtn.addEventListener('click', goToPosesStep);
    cancelRoutineBtn.addEventListener('click', showMainScreen);
    backToNameBtn.addEventListener('click', goToNameStep);
    document.getElementById('poses-selection-header').addEventListener('click', togglePosesGrid);
    document.getElementById('activities-selection-header').addEventListener('click', toggleActivitiesGrid);
    document.getElementById('exercises-selection-header').addEventListener('click', toggleExercisesGrid);
    closeModalBtn.addEventListener('click', hideTimeModal);
    closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDeleteRoutine);
    
    // Safely add event listener for completion modal close button
    if (closeCompletionModalBtn) {
        closeCompletionModalBtn.addEventListener('click', hideCompletionModal);
    } else {
        console.warn('closeCompletionModalBtn not found in DOM');
    }
    // Use event delegation for completion modal back buttons
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'close-completion') {
            console.log('Completion modal back button clicked via delegation');
            event.preventDefault();
            event.stopPropagation();
            hideCompletionModal();
        }
        
        if (event.target && event.target.id === 'close-save-completion') {
            console.log('Save completion modal back button clicked via delegation');
            event.preventDefault();
            event.stopPropagation();
            
            // Use the proper function to hide the modal
            if (typeof hideSaveCompletionModal === 'function') {
                hideSaveCompletionModal();
                console.log('Save completion modal hidden via hideSaveCompletionModal function');
            } else {
                console.error('hideSaveCompletionModal function not found');
            }
        }
    });
    
    // Input listeners are now handled directly in navigation.js to avoid conflicts
    
    // Settings and History screen listeners - use event delegation
    document.addEventListener('click', (event) => {
        console.log('Footer button click detected:', event.target.id, event.target);
        // Check if clicked element is the button or its child (icon)
        const settingsButton = event.target.closest('#settings-btn');
        if (settingsButton) {
            console.log('Settings button clicked via delegation');
            console.log('showSettingsScreen function available:', typeof showSettingsScreen);
            if (checkForActiveModals()) {
                console.log('Modal is active, ignoring Settings click');
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            window.scrollTo(0, 0);
            try {
                showSettingsScreen();
                console.log('showSettingsScreen called successfully');
            } catch (error) {
                console.error('Error calling showSettingsScreen:', error);
            }
        }
    });
    
    document.addEventListener('click', (event) => {
        console.log('Footer button click detected:', event.target.id, event.target);
        // Check if clicked element is the button or its child (icon)
        const historyButton = event.target.closest('#show-history-btn');
        if (historyButton) {
            console.log('History button clicked via delegation');
            console.log('showHistoryScreen function available:', typeof showHistoryScreen);
            if (checkForActiveModals()) {
                console.log('Modal is active, ignoring History click');
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            window.scrollTo(0, 0);
            try {
                showHistoryScreen();
                console.log('showHistoryScreen called successfully');
            } catch (error) {
                console.error('Error calling showHistoryScreen:', error);
            }
        }
    });
    
    // Backup: Direct event listeners for footer buttons
    if (showHistoryBtn) {
        showHistoryBtn.addEventListener('click', (event) => {
            console.log('History button clicked via direct listener');
            event.preventDefault();
            event.stopPropagation();
            window.scrollTo(0, 0);
            try {
                showHistoryScreen();
                console.log('showHistoryScreen called successfully via direct listener');
            } catch (error) {
                console.error('Error calling showHistoryScreen via direct listener:', error);
            }
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (event) => {
            console.log('Settings button clicked via direct listener');
            event.preventDefault();
            event.stopPropagation();
            window.scrollTo(0, 0);
            try {
                showSettingsScreen();
                console.log('showSettingsScreen called successfully via direct listener');
            } catch (error) {
                console.error('Error calling showSettingsScreen via direct listener:', error);
            }
        });
    }
    
    // Safely add event listeners for back buttons
    if (backFromHistory) {
        backFromHistory.addEventListener('click', showMainScreen);
    } else {
        console.warn('backFromHistory not found in DOM');
    }
    
    if (backFromSettings) {
        backFromSettings.addEventListener('click', showMainScreen);
    } else {
        console.warn('backFromSettings not found in DOM');
    }
    
    // History source toggle listeners will be set up when history screen is shown
    
    // Safely add event listeners for history buttons
    if (exportHistoryBtn) {
        exportHistoryBtn.addEventListener('click', exportHistory);
    } else {
        console.warn('exportHistoryBtn not found in DOM');
    }
    
    if (importHistoryBtn) {
        importHistoryBtn.addEventListener('click', showImportHistoryModal);
    } else {
        console.warn('importHistoryBtn not found in DOM');
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', showClearHistoryConfirmation);
    } else {
        console.warn('clearHistoryBtn not found in DOM');
    }
    // Safely add remaining event listeners
    const modalButtons = [
        { element: closeClearHistoryModalBtn, name: 'closeClearHistoryModalBtn' },
        { element: cancelClearHistoryBtn, name: 'cancelClearHistoryBtn' },
        { element: confirmClearHistoryBtn, name: 'confirmClearHistoryBtn' },
        { element: closeImportHistoryModalBtn, name: 'closeImportHistoryModalBtn' },
        { element: cancelImportHistoryBtn, name: 'cancelImportHistoryBtn' },
        { element: confirmImportHistoryBtn, name: 'confirmImportHistoryBtn' },
        { element: closeImportSuccessModalBtn, name: 'closeImportSuccessModalBtn' },
        { element: closeImportSuccessBtn, name: 'closeImportSuccessBtn' }
        // Removed closeImportErrorModalBtn and closeImportErrorBtn as they don't exist in DOM
    ];
    
    modalButtons.forEach(({ element, name }) => {
        if (element) {
            // Add appropriate event listener based on button name
            if (name.includes('ClearHistory')) {
                element.addEventListener('click', hideClearHistoryModal);
            } else if (name.includes('ImportHistory')) {
                element.addEventListener('click', hideImportHistoryModal);
            } else if (name.includes('ImportSuccess')) {
                element.addEventListener('click', hideImportSuccessModal);
            } else if (name.includes('ImportError')) {
                element.addEventListener('click', hideImportErrorModal);
            }
        } else {
            console.warn(`${name} not found in DOM`);
        }
    });
    
    // Special case for confirm buttons
    if (confirmClearHistoryBtn) {
        confirmClearHistoryBtn.addEventListener('click', confirmClearHistory);
    }
    if (confirmImportHistoryBtn) {
        confirmImportHistoryBtn.addEventListener('click', confirmImportHistory);
    }
    
    // Settings screen login listeners
    if (settingsTwitterLoginBtn) {
        settingsTwitterLoginBtn.addEventListener('click', handleTwitterLogin);
    } else {
        console.warn('settingsTwitterLoginBtn not found in DOM');
    }
    
    if (settingsLogoutBtn) {
        settingsLogoutBtn.addEventListener('click', handleLogout);
    } else {
        console.warn('settingsLogoutBtn not found in DOM');
    }
    
    // Rename modal listeners will be set up when modal is shown
    
    // File input listeners
    if (fileInputArea && importFileInput) {
        console.log('Setting up file input listeners for:', { fileInputArea, importFileInput });
        
        // Test if we can programmatically click the file input
        console.log('Testing file input click capability...');
        setTimeout(() => {
            console.log('File input element:', importFileInput);
            console.log('File input disabled:', importFileInput.disabled);
            console.log('File input style display:', importFileInput.style.display);
        }, 1000);
        
        fileInputArea.addEventListener('click', (event) => {
            console.log('File input area clicked!', event);
            console.log('Event target:', event.target);
            console.log('Event currentTarget:', event.currentTarget);
            event.preventDefault();
            event.stopPropagation();
            console.log('About to trigger file input click');
            
            // Make sure the file input is visible and enabled
            importFileInput.style.display = 'block';
            importFileInput.disabled = false;
            
            try {
                importFileInput.click();
                console.log('File input click triggered successfully');
            } catch (error) {
                console.error('Error triggering file input click:', error);
            }
        });
        
        importFileInput.addEventListener('change', (event) => {
            console.log('File input change event:', event);
            handleFileSelect(event);
        });
        
        // Also try adding mousedown event as backup
        fileInputArea.addEventListener('mousedown', (event) => {
            console.log('File input area mousedown event:', event);
        });
        
    } else {
        console.error('File input elements not found:', { fileInputArea, importFileInput });
    }
    
    // Drag and drop listeners
    if (fileInputArea) {
        fileInputArea.addEventListener('dragover', handleDragOver);
        fileInputArea.addEventListener('dragleave', handleDragLeave);
        fileInputArea.addEventListener('drop', handleFileDrop);
    }
    
    // Authentication event listeners
    closeUserModalBtn.addEventListener('click', hideUserModal);
    twitterLoginBtn.addEventListener('click', handleTwitterLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    // User ID Modal event listeners
    closeUseridModalBtn.addEventListener('click', hideUseridModal);
    closeUseridBtn.addEventListener('click', hideUseridModal);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Add click handlers directly to time and repetition options after DOM loads
    // This is more reliable than event delegation for modal elements
    setupTimeAndRepClickHandlers();
});

// Setup click handlers for time and repetition options
function setupTimeAndRepClickHandlers() {
    // Get all time options
    const timeOptions = document.querySelectorAll('.time-option');
    
    timeOptions.forEach(option => {
        // Remove any existing listeners by cloning
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        // Add new listener
        newOption.addEventListener('click', function(e) {
            e.stopPropagation();
            const time = parseInt(this.dataset.time);
            if (!isNaN(time)) {
                selectTime(time, this);
            }
        });
    });
    
    // Get all repetition options
    const repOptions = document.querySelectorAll('.repetition-option');
    
    repOptions.forEach(option => {
        // Remove any existing listeners by cloning
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        // Add new listener
        newOption.addEventListener('click', function(e) {
            e.stopPropagation();
            const reps = parseInt(this.dataset.reps);
            if (!isNaN(reps)) {
                selectRepetition(reps, this);
            }
        });
    });
}

// Re-setup handlers when modal is shown
function reinitializeModalHandlers() {
    setupTimeAndRepClickHandlers();
}
