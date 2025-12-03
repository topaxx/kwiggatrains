// Navigation and UI Management Functions

// Screen navigation functions
function showMainScreen() {
    hideAllScreens();
    mainScreen.classList.add('active');
    // Stop train execution and all sounds when returning to main screen
    stopTrainExecution();
    renderTrains();
    // Scroll to top when loading main screen
    window.scrollTo(0, 0);
}

// Make showMainScreen globally available
window.showMainScreen = showMainScreen;

function showSettingsScreen() {
    hideAllScreens();
    settingsScreen.classList.add('active');
    // Update settings screen with current auth state
    updateSettingsAuthUI();
    // Initialize settings values
    initializeSettings();
    // Setup settings listeners (in case they weren't set up yet or need to be refreshed)
    setupSettingsListeners();
    // Scroll to top when loading settings screen
    window.scrollTo(0, 0);
}

function initializeSettings() {
    // Set completion sound dropdown to saved value
    const completionSoundSelect = document.getElementById('completion-sound-select');
    if (completionSoundSelect) {
        completionSoundSelect.value = selectedCompletionSound;
    }
    
    // Set bell sound dropdown to saved value
    const bellSoundSelect = document.getElementById('bell-sound-select');
    if (bellSoundSelect) {
        bellSoundSelect.value = selectedBellSound;
    }
}

// Make showSettingsScreen globally available
window.showSettingsScreen = showSettingsScreen;


function showTrainBuilder() {
    hideAllScreens();
    trainBuilder.classList.add('active');
    // Stop train execution and all sounds when creating new train
    stopTrainExecution();
    currentTrain = [];
    currentTrainName = "";
    selectedPose = null;
    selectedExercise = null;
    selectedTime = null;
    currentStep = 'name';
    trainNameInput.value = "";
    showStep('name');
    updateNextButton();
    updateSaveButton();
    // Scroll to top when loading train builder
    window.scrollTo(0, 0);
    
    // Auto-focus on the train name input with longer delay
    setTimeout(() => {
        const input = document.getElementById('train-name-input');
        if (input) {
            // Ensure input is empty before focusing
            input.value = "";
            input.focus();
            console.log('Train name input cleared and focused automatically');
        }
        
        // Setup direct event listener on the input element
        setupTrainNameInputListener();
    }, 200);
}

function setupTrainNameInputListener() {
    const input = document.getElementById('train-name-input');
    if (input) {
        // Store current focus state
        const wasFocused = document.activeElement === input;
        
        // Remove any existing listeners by cloning
        const newInput = input.cloneNode(true);
        // Ensure the cloned input is empty
        newInput.value = "";
        input.parentNode.replaceChild(newInput, input);
        
        // Restore focus if it was focused before
        if (wasFocused) {
            setTimeout(() => {
                newInput.focus();
                console.log('Focus restored after cloning input element');
            }, 10);
        }
        
        // Add direct event listeners
        newInput.addEventListener('input', (e) => {
            console.log('Direct input event - value:', e.target.value);
            updateNextButton();
            updateSaveButton();
        });
        
        newInput.addEventListener('keyup', (e) => {
            console.log('Direct keyup event - value:', e.target.value);
            updateNextButton();
            updateSaveButton();
        });
        
        console.log('Train name input listener setup complete');
    } else {
        console.error('Could not find train-name-input element');
    }
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Step navigation functions
function showStep(step) {
    // Hide all steps
    nameStep.classList.remove('active');
    posesStep.classList.remove('active');
    
    // Show selected step
    if (step === 'name') {
        nameStep.classList.add('active');
        currentStep = 'name';
        
        // Auto-focus on input when name step becomes visible
        setTimeout(() => {
            const input = document.getElementById('train-name-input');
            if (input) {
                // Clear input when name step is shown
                input.value = "";
                input.focus();
                console.log('Input cleared and focused when name step shown');
            }
        }, 100);
    } else if (step === 'poses') {
        posesStep.classList.add('active');
        currentStep = 'poses';
    }
}

function goToPosesStep() {
    currentTrainName = trainNameInput.value.trim();
    showStep('poses');
    // Start with poses grid collapsed
    posesGridContainer.classList.remove('expanded');
    posesGridContainer.classList.add('collapsed');
    togglePosesGridBtn.classList.remove('rotated');
    // Start with exercises grid collapsed
    exercisesGridContainer.classList.remove('expanded');
    exercisesGridContainer.classList.add('collapsed');
    toggleExercisesGridBtn.classList.remove('rotated');
    // Update save button state
    updateSaveButton();
}

function goToNameStep() {
    showStep('name');
    
    // Auto-focus on the train name input when returning to name step
    setTimeout(() => {
        const input = document.getElementById('train-name-input');
        if (input) {
            // Clear input when returning to name step
            input.value = "";
            input.focus();
            console.log('Train name input cleared and focused when returning to name step');
        }
        setupTrainNameInputListener(); // Re-setup listeners
    }, 200);
}

function updateNextButton() {
    // Get fresh reference to both elements
    const input = document.getElementById('train-name-input');
    const nextBtn = document.getElementById('next-to-poses');
    const titleElement = document.getElementById('train-builder-title');
    
    const hasName = input && input.value.trim().length > 0;
    const trainName = input ? input.value.trim() : '';
    
    console.log('updateNextButton called:');
    console.log('- Input element found:', !!input);
    console.log('- Input value:', input ? input.value : 'N/A');
    console.log('- Has name:', hasName);
    console.log('- Next button found:', !!nextBtn);
    
    // Update the title with the train name
    if (titleElement) {
        if (hasName && trainName) {
            titleElement.textContent = trainName;
            titleElement.style.fontSize = '2.2rem';
            titleElement.style.fontWeight = '900';
            titleElement.style.textShadow = '0 3px 6px rgba(0,0,0,0.15)';
            console.log('- Title updated to:', trainName);
        } else {
            titleElement.textContent = 'Add Train';
            titleElement.style.fontSize = '2.2rem';
            titleElement.style.fontWeight = '900';
            titleElement.style.textShadow = '0 3px 6px rgba(0,0,0,0.15)';
        }
    }
    
    if (nextBtn) {
        nextBtn.disabled = !hasName;
        console.log('- Next button disabled:', nextBtn.disabled);
        
        // Update visual state to make it purple and clickable
        if (hasName) {
            nextBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            nextBtn.style.color = 'white';
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
            nextBtn.style.transform = 'none';
            console.log('- Button enabled: purple background applied');
        } else {
            nextBtn.style.background = '#e2e8f0';
            nextBtn.style.color = '#a0aec0';
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'not-allowed';
            console.log('- Button disabled: gray background applied');
        }
    } else {
        console.error('Next button element not found');
    }
}

// Grid toggle functions
function togglePosesGrid() {
    const isCollapsed = posesGridContainer.classList.contains('collapsed');
    
    if (isCollapsed) {
        posesGridContainer.classList.remove('collapsed');
        posesGridContainer.classList.add('expanded');
        togglePosesGridBtn.classList.add('rotated');
    } else {
        posesGridContainer.classList.remove('expanded');
        posesGridContainer.classList.add('collapsed');
        togglePosesGridBtn.classList.remove('rotated');
        // Clear any selected pose when collapsing
        document.querySelectorAll('.pose-option').forEach(el => el.classList.remove('selected'));
        selectedPose = null;
    }
}

function toggleActivitiesGrid() {
    const container = document.getElementById('activities-grid-container');
    const icon = toggleActivitiesIcon;
    
    if (container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        container.classList.add('collapsed');
        icon.textContent = '▼';
        toggleActivitiesGridBtn.classList.remove('rotated');
    } else {
        container.classList.remove('collapsed');
        container.classList.add('expanded');
        icon.textContent = '▼';
        toggleActivitiesGridBtn.classList.add('rotated');
    }
}

function toggleExercisesGrid() {
    const isCollapsed = exercisesGridContainer.classList.contains('collapsed');
    
    if (isCollapsed) {
        exercisesGridContainer.classList.remove('collapsed');
        exercisesGridContainer.classList.add('expanded');
        toggleExercisesGridBtn.classList.add('rotated');
    } else {
        exercisesGridContainer.classList.remove('expanded');
        exercisesGridContainer.classList.add('collapsed');
        toggleExercisesGridBtn.classList.remove('rotated');
        // Clear any selected exercise when collapsing
        document.querySelectorAll('.exercise-option').forEach(el => el.classList.remove('selected'));
        selectedExercise = null;
    }
}

// Modal management functions
function showTimeModal(item) {
    // Check if it's an exercise by checking the image path
    const isExercise = item.image && item.image.includes('exercise_images/');
    
    if (isExercise) {
        // It's an exercise - show repetitions section
        selectedExercise = item;
        selectedPose = null;
        repetitionsSection.style.display = 'block';
        modalPoseName.textContent = `Select duration`;
    } else {
        // It's a pose or activity - hide repetitions section
        selectedPose = item;
        selectedExercise = null;
        repetitionsSection.style.display = 'none';
        modalPoseName.textContent = `Select time`;
    }
    
    // Clear any previous selections in the modal
    clearModalSelections();
    
    timeSelectionModal.classList.add('active');
    
    // Re-initialize click handlers for the modal
    // Small delay to ensure modal is visible
    setTimeout(() => {
        if (typeof reinitializeModalHandlers === 'function') {
            reinitializeModalHandlers();
        }
    }, 50);
}

// Clear all selections in the modal
function clearModalSelections() {
    // Clear time option selections
    document.querySelectorAll('.time-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Clear repetition option selections
    document.querySelectorAll('.repetition-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Clear selected time variable
    selectedTime = null;
}

function hideTimeModal() {
    timeSelectionModal.classList.remove('active');
    selectedPose = null;
    selectedExercise = null;
    selectedTime = null;
}

// Delete confirmation functions
function showDeleteConfirmation(trainId) {
    trainToDelete = trains.find(r => r.id === trainId);
    if (trainToDelete) {
        deleteConfirmationText.innerHTML = `Are you sure you want to delete<br><br><strong>${trainToDelete.name}</strong><br><br>`;
        deleteConfirmationModal.classList.add('active');
    }
}

function hideDeleteModal() {
    deleteConfirmationModal.classList.remove('active');
    trainToDelete = null;
}

// Rename modal functions
function showRenameModal(trainId) {
    trainToRename = trains.find(r => r.id === trainId);
    if (trainToRename) {
        // Clear any existing value and set the correct train name
        renameInput.value = '';
        setTimeout(() => {
            renameInput.value = trainToRename.name;
            renameInput.select(); // Select all text for easy editing
            // Update button state after setting the value
            updateRenameButton();
        }, 10);
        
        renameModal.classList.add('active');
        
        // Initially disable the save button since no changes have been made yet
        confirmRenameBtn.disabled = true;
        confirmRenameBtn.style.background = '#e2e8f0';
        confirmRenameBtn.style.color = '#a0aec0';
        confirmRenameBtn.style.cursor = 'not-allowed';
        
        // Re-setup event listeners when modal is shown
        setupRenameModalListeners();
    }
}

// Setup rename modal event listeners
function setupRenameModalListeners() {
    console.log('Setting up rename modal listeners');
    
    // Get fresh references to elements
    const closeBtn = document.getElementById('close-rename-modal');
    const cancelBtn = document.getElementById('cancel-rename');
    const saveBtn = document.getElementById('confirm-rename');
    const input = document.getElementById('rename-input');
    
    if (closeBtn) {
        // Remove existing listeners by cloning
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        newCloseBtn.addEventListener('click', (e) => {
            console.log('Close rename modal clicked (fresh listener)');
            e.preventDefault();
            e.stopPropagation();
            hideRenameModal();
        });
    }
    
    if (cancelBtn) {
        // Remove existing listeners by cloning
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', (e) => {
            console.log('Cancel rename clicked (fresh listener)');
            e.preventDefault();
            e.stopPropagation();
            hideRenameModal();
        });
    }
    
    if (saveBtn) {
        // Remove existing listeners by cloning
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        
        newSaveBtn.addEventListener('click', (e) => {
            console.log('Save rename clicked (fresh listener)');
            e.preventDefault();
            e.stopPropagation();
            confirmRenameTrain();
        });
    }
    
    if (input) {
        // Store current focus state and value
        const wasFocused = document.activeElement === input;
        const currentValue = trainToRename ? trainToRename.name : '';
        
        // Remove existing listeners by cloning
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        // Set the correct value and restore focus
        newInput.value = currentValue;
        if (wasFocused) {
            setTimeout(() => {
                newInput.focus();
                newInput.select(); // Select all text for easy editing
                console.log('Focus restored after cloning rename input element with value:', currentValue);
            }, 10);
        }
        
        newInput.addEventListener('input', updateRenameButton);
        newInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Enter pressed in rename input');
                confirmRenameTrain();
            }
        });
        
        // Update button state after setting up the input
        updateRenameButton();
    }
    
    console.log('Rename modal listeners setup complete');
}

function hideRenameModal() {
    renameModal.classList.remove('active');
    trainToRename = null;
}

function updateRenameButton() {
    const currentValue = renameInput.value.trim();
    const originalValue = trainToRename ? trainToRename.name.trim() : '';
    const hasChanged = currentValue !== originalValue && currentValue.length > 0;
    
    confirmRenameBtn.disabled = !hasChanged;
    
    // Update visual state
    if (hasChanged) {
        confirmRenameBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        confirmRenameBtn.style.color = 'white';
        confirmRenameBtn.style.cursor = 'pointer';
    } else {
        confirmRenameBtn.style.background = '#e2e8f0';
        confirmRenameBtn.style.color = '#a0aec0';
        confirmRenameBtn.style.cursor = 'not-allowed';
    }
}

// Utility functions
function formatDuration(seconds) {
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // If 60 minutes or more, show in hours and minutes
    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (minutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${minutes}min`;
        }
    }
    
    // For less than 60 minutes, show in minutes and seconds
    if (totalMinutes === 0) {
        return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
        return `${totalMinutes}m`;
    } else {
        return `${totalMinutes}m ${remainingSeconds}s`;
    }
}
