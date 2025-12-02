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
    renderTrains();
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
    console.log('- addTrainBtn:', addTrainBtn);
    console.log('- settingsBtn:', settingsBtn);
    console.log('- showHistoryBtn:', showHistoryBtn);
    
    // Debug: Check if functions are available
    console.log('Function availability check:');
    console.log('- showTrainBuilder:', typeof showTrainBuilder);
    console.log('- showSettingsScreen:', typeof showSettingsScreen);
    console.log('- showHistoryScreen:', typeof showHistoryScreen);
    
    addTrainBtn.addEventListener('click', () => {
        console.log('Add Train button clicked');
        window.scrollTo(0, 0);
        showTrainBuilder();
    });
    backFromBuilder.addEventListener('click', showMainScreen);
    backFromExecution.addEventListener('click', showMainScreen);
    // Use event delegation for Save Train button to ensure it works
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'save-train-btn') {
            console.log('Save Train button clicked via delegation');
            if (checkForActiveModals()) {
                console.log('Modal is active, ignoring Save Train click');
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            saveTrain();
        }
    });
    pauseResumeBtn.addEventListener('click', togglePause);
    nextPoseBtn.addEventListener('click', nextPose);
    previousPoseBtn.addEventListener('click', previousPose);
    
    // New event listeners for step-by-step flow
    nextToPosesBtn.addEventListener('click', goToPosesStep);
    cancelTrainBtn.addEventListener('click', showMainScreen);
    backToNameBtn.addEventListener('click', goToNameStep);
    document.getElementById('poses-selection-header').addEventListener('click', togglePosesGrid);
    document.getElementById('activities-selection-header').addEventListener('click', toggleActivitiesGrid);
    document.getElementById('exercises-selection-header').addEventListener('click', toggleExercisesGrid);
    closeModalBtn.addEventListener('click', hideTimeModal);
    closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDeleteTrain);
    
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
        { element: closeImportSuccessBtn, name: 'closeImportSuccessBtn' },
        { element: closeLogoutSuccessBtn, name: 'closeLogoutSuccessBtn' },
        { element: closeDeleteErrorBtn, name: 'closeDeleteErrorBtn' },
        { element: okDeleteErrorBtn, name: 'okDeleteErrorBtn' },
        { element: closeImportErrorBtn, name: 'closeImportErrorBtn' },
        { element: okImportErrorBtn, name: 'okImportErrorBtn' }
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
            } else if (name.includes('LogoutSuccess')) {
                element.addEventListener('click', hideLogoutSuccessModal);
            } else if (name.includes('DeleteError')) {
                element.addEventListener('click', hideDeleteErrorModal);
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
        
        // File input area click is now handled by history.js showImportHistoryModal
        // No need to add duplicate event listener here
        
        // File input change event is now handled by history.js
        // No need to add duplicate event listener here
        
        // File input events are now handled by history.js
        // No need to add duplicate event listeners here
        
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
    
    // Add train to history modal event listeners
    if (addTrainHistoryBtn) {
        addTrainHistoryBtn.addEventListener('click', showAddTrainHistoryModal);
    } else {
        console.warn('addTrainHistoryBtn not found in DOM');
    }
    
    // Group management event listeners
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', showCreateGroupModal);
    } else {
        console.warn('createGroupBtn not found in DOM');
    }
    
    if (closeCreateGroupModalBtn) {
        closeCreateGroupModalBtn.addEventListener('click', hideCreateGroupModal);
    }
    
    if (cancelCreateGroupBtn) {
        cancelCreateGroupBtn.addEventListener('click', hideCreateGroupModal);
    }
    
    if (confirmCreateGroupBtn) {
        confirmCreateGroupBtn.addEventListener('click', createGroup);
    }
    
    if (closeManageGroupModalBtn) {
        closeManageGroupModalBtn.addEventListener('click', hideManageGroupModal);
    }
    
    if (cancelManageGroupBtn) {
        cancelManageGroupBtn.addEventListener('click', hideManageGroupModal);
    }
    
    if (saveManageGroupBtn) {
        saveManageGroupBtn.addEventListener('click', saveManageGroup);
    }
    
    if (deleteGroupBtn) {
        deleteGroupBtn.addEventListener('click', showDeleteGroupConfirmation);
    }
    
    // Delete group confirmation modal event listeners
    const closeDeleteGroupModalBtn = document.getElementById('close-delete-group-modal');
    const cancelDeleteGroupBtn = document.getElementById('cancel-delete-group');
    const confirmDeleteGroupBtn = document.getElementById('confirm-delete-group');
    
    if (closeDeleteGroupModalBtn) {
        closeDeleteGroupModalBtn.addEventListener('click', hideDeleteGroupConfirmation);
    }
    
    if (cancelDeleteGroupBtn) {
        cancelDeleteGroupBtn.addEventListener('click', hideDeleteGroupConfirmation);
    }
    
    if (confirmDeleteGroupBtn) {
        confirmDeleteGroupBtn.addEventListener('click', deleteGroup);
    }
    
    // Enable/disable create group button based on input
    if (groupNameInput) {
        groupNameInput.addEventListener('input', () => {
            if (confirmCreateGroupBtn) {
                confirmCreateGroupBtn.disabled = !groupNameInput.value.trim();
            }
        });
    }
    
    // Add train to group dropdown change
    if (addTrainToGroupDropdown) {
        addTrainToGroupDropdown.addEventListener('change', () => {
            if (addTrainToGroupDropdown.value) {
                addTrainToGroup();
                addTrainToGroupDropdown.value = ''; // Reset selection
            }
        });
    }
    
    if (closeAddTrainHistoryModalBtn) {
        closeAddTrainHistoryModalBtn.addEventListener('click', hideAddTrainHistoryModal);
    } else {
        console.warn('closeAddTrainHistoryModalBtn not found in DOM');
    }
    
    if (cancelAddTrainHistoryBtn) {
        cancelAddTrainHistoryBtn.addEventListener('click', hideAddTrainHistoryModal);
    } else {
        console.warn('cancelAddTrainHistoryBtn not found in DOM');
    }
    
    if (confirmAddTrainHistoryBtn) {
        confirmAddTrainHistoryBtn.addEventListener('click', confirmAddTrainToHistory);
    } else {
        console.warn('confirmAddTrainHistoryBtn not found in DOM');
    }
    
    // Enable/disable confirm button based on selection
    if (selectTrainDropdown && completionDateInput) {
        selectTrainDropdown.addEventListener('change', () => {
            updateAddTrainHistoryButtonState();
        });
        
        completionDateInput.addEventListener('change', () => {
            updateAddTrainHistoryButtonState();
        });
    }
}

// Helper function to update button state
function updateAddTrainHistoryButtonState() {
    if (selectTrainDropdown && completionDateInput && confirmAddTrainHistoryBtn) {
        const hasTrain = selectTrainDropdown.value !== '';
        const hasDate = completionDateInput.value !== '';
        confirmAddTrainHistoryBtn.disabled = !(hasTrain && hasDate);
    }
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
