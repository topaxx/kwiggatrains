// Navigation and UI Management Functions

// Screen navigation functions
function showMainScreen() {
    hideAllScreens();
    mainScreen.classList.add('active');
    // Stop routine execution and all sounds when returning to main screen
    stopRoutineExecution();
    renderRoutines();
    // Scroll to top when loading main screen
    window.scrollTo(0, 0);
}

function showSettingsScreen() {
    hideAllScreens();
    settingsScreen.classList.add('active');
    // Update settings screen with current auth state
    updateSettingsAuthUI();
    // Scroll to top when loading settings screen
    window.scrollTo(0, 0);
}

function showHistoryScreen() {
    hideAllScreens();
    historyScreen.classList.add('active');
    // Stop routine execution and all sounds when viewing history
    stopRoutineExecution();
    // Refresh completion log from localStorage before rendering
    completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    console.log('Loading history screen, found', completionLog.length, 'entries');
    renderHistory();
}

function showRoutineBuilder() {
    hideAllScreens();
    routineBuilder.classList.add('active');
    // Stop routine execution and all sounds when creating new routine
    stopRoutineExecution();
    currentRoutine = [];
    currentRoutineName = "";
    selectedPose = null;
    selectedExercise = null;
    selectedTime = null;
    currentStep = 'name';
    routineNameInput.value = "";
    showStep('name');
    updateNextButton();
    // Scroll to top when loading routine builder
    window.scrollTo(0, 0);
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
    } else if (step === 'poses') {
        posesStep.classList.add('active');
        currentStep = 'poses';
    }
}

function goToPosesStep() {
    currentRoutineName = routineNameInput.value.trim();
    showStep('poses');
    // Start with poses grid collapsed
    posesGridContainer.classList.remove('expanded');
    posesGridContainer.classList.add('collapsed');
    togglePosesGridBtn.classList.remove('rotated');
    // Start with exercises grid collapsed
    exercisesGridContainer.classList.remove('expanded');
    exercisesGridContainer.classList.add('collapsed');
    toggleExercisesGridBtn.classList.remove('rotated');
}

function goToNameStep() {
    showStep('name');
}

function updateNextButton() {
    const hasName = routineNameInput.value.trim().length > 0;
    nextToPosesBtn.disabled = !hasName;
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
        icon.textContent = '▶';
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
        modalPoseName.textContent = `Select duration for ${item.name}`;
    } else {
        // It's a pose or activity - hide repetitions section
        selectedPose = item;
        selectedExercise = null;
        repetitionsSection.style.display = 'none';
        modalPoseName.textContent = `Select time for ${item.name}`;
    }
    
    timeSelectionModal.classList.add('active');
}

function hideTimeModal() {
    timeSelectionModal.classList.remove('active');
    selectedPose = null;
    selectedExercise = null;
    selectedTime = null;
}

// Delete confirmation functions
function showDeleteConfirmation(routineId) {
    routineToDelete = routines.find(r => r.id === routineId);
    if (routineToDelete) {
        deleteConfirmationText.textContent = `Are you sure you want to delete "${routineToDelete.name}"?`;
        deleteConfirmationModal.classList.add('active');
    }
}

function hideDeleteModal() {
    deleteConfirmationModal.classList.remove('active');
    routineToDelete = null;
}

// Rename modal functions
function showRenameModal(routineId) {
    routineToRename = routines.find(r => r.id === routineId);
    if (routineToRename) {
        renameInput.value = routineToRename.name;
        renameModal.classList.add('active');
        updateRenameButton();
    }
}

function hideRenameModal() {
    renameModal.classList.remove('active');
    routineToRename = null;
}

function updateRenameButton() {
    const hasName = renameInput.value.trim().length > 0;
    confirmRenameBtn.disabled = !hasName;
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
