// Yoga poses data - using images from Yoga Poses folder
const yogaPoses = [
    { id: 1, name: "Ankle Stretch", image: "yoga_pose_images/anklestretch_pose.png" },
    { id: 2, name: "Bridge Pose", image: "yoga_pose_images/bridge_pose.png" },
    { id: 3, name: "Butterfly Pose", image: "yoga_pose_images/butterfly_pose.png" },
    { id: 4, name: "Camel Pose", image: "yoga_pose_images/camel_pose.png" },
    { id: 5, name: "Caterpillar Pose", image: "yoga_pose_images/catterpilar_pose.png" },
    { id: 6, name: "Child's Pose", image: "yoga_pose_images/childs_pose.png" },
    { id: 7, name: "Dangling Pose", image: "yoga_pose_images/dangling_pose.png" },
    { id: 8, name: "Downward Facing Dog", image: "yoga_pose_images/downwardfacingdog_pose.png" },
    { id: 9, name: "Frog Pose", image: "yoga_pose_images/frog_pose.png" },
    { id: 10, name: "Half Butterfly", image: "yoga_pose_images/halfbutterfly_pose.png" },
    { id: 11, name: "Happy Baby", image: "yoga_pose_images/happybaby_pose.png" },
    { id: 12, name: "Meditate", image: "yoga_pose_images/butterfly_pose.png" },
    { id: 13, name: "Saddle Pose", image: "yoga_pose_images/saddle_pose.png" },
    { id: 14, name: "Seal Pose", image: "yoga_pose_images/seal_pose.png" },
    { id: 15, name: "Sphinx Pose", image: "yoga_pose_images/sphinx_pose.png" },
    { id: 16, name: "Swan Pose", image: "yoga_pose_images/swan_pose.png" }
];

// Exercises data - using images from exercise_images folder
const exercises = [
    { id: 0, name: "Push-ups", image: "exercise_images/pushups.png" },
    { id: 1, name: "Squats", image: "exercise_images/squats.png" },
    { id: 2, name: "Plank", image: "exercise_images/plank.png" },
    { id: 3, name: "Lunges", image: "exercise_images/lunges.png" },
    { id: 4, name: "Burpees", image: "exercise_images/burpees.png" },
    { id: 5, name: "Mountain Climbers", image: "exercise_images/mountain_climbers.png" },
    { id: 6, name: "Jumping Jacks", image: "exercise_images/jumping_jacks.png" },
    { id: 7, name: "Wall Sit", image: "exercise_images/wall_sit.png" },
    { id: 8, name: "Tricep Dips", image: "exercise_images/tricep_dips.png" },
    { id: 9, name: "High Knees", image: "exercise_images/high_knees.png" },
    { id: 10, name: "Glute Bridges", image: "exercise_images/glute_bridges.png" },
    { id: 11, name: "Russian Twists", image: "exercise_images/russian_twists.png" },
    { id: 12, name: "Calf Raises", image: "exercise_images/calf_raises.png" },
    { id: 13, name: "Leg Raises", image: "exercise_images/leg_raises.png" },
    { id: 14, name: "Bear Crawl", image: "exercise_images/bear_crawl.png" },
    { id: 15, name: "Single Leg Deadlift", image: "exercise_images/single_leg_deadlift.png" },
    { id: 16, name: "Side Plank", image: "exercise_images/side_plank.png" },
    { id: 17, name: "Pike Push-ups", image: "exercise_images/pike_pushups.png" },
    { id: 18, name: "Jump Squats", image: "exercise_images/jump_squats.png" },
    { id: 19, name: "Hollow Body Hold", image: "exercise_images/hollow_body_hold.png" },
    { id: 20, name: "Arm Circles", image: "exercise_images/arm_circles.png" },
    { id: 21, name: "Hip Thrusts", image: "exercise_images/hip_thrusts.png" },
    { id: 22, name: "Superman", image: "exercise_images/superman.png" },
    { id: 23, name: "Flutter Kicks", image: "exercise_images/flutter_kicks.png" },
    { id: 24, name: "Crab Walk", image: "exercise_images/crab_walk.png" }
];

// Tijd opties
const timeOptions = [
    { value: 30, label: "30s" },
    { value: 60, label: "1m" },
    { value: 120, label: "2m" },
    { value: 180, label: "3m" },
    { value: 300, label: "5m" },
    { value: 600, label: "10m" },
    { value: 900, label: "15m" },
    { value: 1200, label: "20m" },
    { value: 1800, label: "30m" }
];

// App state
let currentRoutine = [];
let currentRoutineName = "";
let selectedPose = null;
let selectedExercise = null;
let selectedTime = null;
let routines = JSON.parse(localStorage.getItem('yogaRoutines') || '[]');
let currentExecutionRoutine = null;
let currentPoseIndex = 0;
let timer = null;
let isPaused = false;
let currentStep = 'name'; // 'name' or 'poses'
let routineToDelete = null;
let routineToRename = null;
let currentTimeLeft = 0; // Track remaining time for pause/resume
let completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
let bellSound = null; // Audio object for bell sound
let bowlSound = null; // Audio object for bowl sound

// Initialize bell sound
function initBellSound() {
    bellSound = new Audio('bellsound.mp3');
    bellSound.preload = 'auto';
    bellSound.volume = 0.7; // Set volume to 70%
}

// Initialize bowl sound
function initBowlSound() {
    bowlSound = new Audio('bowlsound.mp3');
    bowlSound.preload = 'auto';
    bowlSound.volume = 1; // Set volume to 100%
}

// Bell sound function
function playBellSound() {
    if (bellSound) {
        bellSound.currentTime = 0; // Reset to beginning
        bellSound.play().catch(error => {
            console.log('Could not play bell sound:', error);
        });
    }
}

// Bowl sound function
function playBowlSound() {
    if (bowlSound) {
        bowlSound.currentTime = 0; // Reset to beginning
        bowlSound.play().catch(error => {
            console.log('Could not play bowl sound:', error);
        });
    }
}

// Stop all sounds function with fade out animation
function stopAllSounds() {
    const fadeOutDuration = 1000; // 1 seconds
    const fadeOutSteps = 10; // Number of steps for smooth fade
    const stepDuration = fadeOutDuration / fadeOutSteps;
    
    // Fade out bell sound
    if (bellSound && !bellSound.paused) {
        fadeOutSound(bellSound, fadeOutSteps, stepDuration);
    }
    
    // Fade out bowl sound
    if (bowlSound && !bowlSound.paused) {
        fadeOutSound(bowlSound, fadeOutSteps, stepDuration);
    }
}

// Stop routine execution completely
function stopRoutineExecution() {
    // Clear timer
    clearTimeout(timer);
    timer = null;
    
    // Reset execution state
    isPaused = false;
    currentPoseIndex = 0;
    currentTimeLeft = 0;
    
    // Reset execution routine
    currentExecutionRoutine = null;
    
    // Stop all sounds
    stopAllSounds();
}

// Fade out individual sound
function fadeOutSound(audio, steps, stepDuration) {
    const initialVolume = audio.volume;
    const volumeStep = initialVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, initialVolume - (volumeStep * currentStep));
        audio.volume = newVolume;
        
        if (currentStep >= steps || newVolume <= 0) {
            clearInterval(fadeInterval);
            audio.pause();
            audio.currentTime = 0;
            // Reset volume to original level for next use
            audio.volume = initialVolume;
        }
    }, stepDuration);
}

// DOM elements
const mainScreen = document.getElementById('main-screen');
const routineBuilder = document.getElementById('routine-builder');
const routineExecution = document.getElementById('routine-execution');
const historyScreen = document.getElementById('history-screen');
const routinesList = document.getElementById('routines-list');
const addRoutineBtn = document.getElementById('add-routine-btn');
const showHistoryBtn = document.getElementById('show-history-btn');
const backFromBuilder = document.getElementById('back-from-builder');
const backFromExecution = document.getElementById('back-from-execution');
const backFromHistory = document.getElementById('back-from-history');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const routineNameInput = document.getElementById('routine-name-input');
const posesGrid = document.getElementById('poses-grid');
const exercisesGrid = document.getElementById('exercises-grid');
const routinePosesList = document.getElementById('routine-poses-list');
const saveRoutineBtn = document.getElementById('save-routine-btn');
const currentPoseImage = document.getElementById('current-pose-image');
const currentPoseName = document.getElementById('current-pose-name');
const timerDisplay = document.getElementById('timer-display');
const progressFill = document.getElementById('progress-fill');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const nextPoseBtn = document.getElementById('next-pose-btn');
const previousPoseBtn = document.getElementById('previous-pose-btn');
const poseCounter = document.getElementById('pose-counter');
const executionRoutineName = document.getElementById('execution-routine-name');

// New DOM elements for step-by-step flow
const nameStep = document.getElementById('name-step');
const posesStep = document.getElementById('poses-step');
const nextToPosesBtn = document.getElementById('next-to-poses');
const cancelRoutineBtn = document.getElementById('cancel-routine');
const backToNameBtn = document.getElementById('back-to-name');
const posesGridContainer = document.getElementById('poses-grid-container');
const exercisesGridContainer = document.getElementById('exercises-grid-container');
const togglePosesGridBtn = document.getElementById('toggle-poses-grid');
const toggleExercisesGridBtn = document.getElementById('toggle-exercises-grid');
const toggleIcon = document.getElementById('toggle-icon');
const toggleExercisesIcon = document.getElementById('toggle-exercises-icon');
const timeSelectionModal = document.getElementById('time-selection-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalPoseName = document.getElementById('modal-pose-name');
const repetitionsSection = document.getElementById('repetitions-section');
const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
const closeDeleteModalBtn = document.getElementById('close-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const deleteConfirmationText = document.getElementById('delete-confirmation-text');
const completionModal = document.getElementById('completion-modal');
const closeCompletionModalBtn = document.getElementById('close-completion-modal');
const closeCompletionBtn = document.getElementById('close-completion');
const completionText = document.getElementById('completion-text');
const historyStats = document.getElementById('history-stats');
const historyList = document.getElementById('history-list');
const clearHistoryModal = document.getElementById('clear-history-modal');
const closeClearHistoryModalBtn = document.getElementById('close-clear-history-modal');
const cancelClearHistoryBtn = document.getElementById('cancel-clear-history');
const confirmClearHistoryBtn = document.getElementById('confirm-clear-history');
const clearHistoryText = document.getElementById('clear-history-text');
const exportHistoryBtn = document.getElementById('export-history-btn');
const importHistoryBtn = document.getElementById('import-history-btn');
const importHistoryModal = document.getElementById('import-history-modal');
const closeImportHistoryModalBtn = document.getElementById('close-import-history-modal');
const cancelImportHistoryBtn = document.getElementById('cancel-import-history');
const confirmImportHistoryBtn = document.getElementById('confirm-import-history');
const importFileInput = document.getElementById('import-file-input');
const fileInputArea = document.getElementById('file-input-area');
const importSuccessModal = document.getElementById('import-success-modal');
const closeImportSuccessModalBtn = document.getElementById('close-import-success-modal');
const closeImportSuccessBtn = document.getElementById('close-import-success');
const importSuccessText = document.getElementById('import-success-text');
const renameModal = document.getElementById('rename-modal');
const closeRenameModalBtn = document.getElementById('close-rename-modal');
const cancelRenameBtn = document.getElementById('cancel-rename');
const confirmRenameBtn = document.getElementById('confirm-rename');
const renameInput = document.getElementById('rename-input');

// Initialize app
function init() {
    initBellSound();
    initBowlSound();
    renderRoutines();
    renderPoses();
    setupEventListeners();
}

// Event listeners
function setupEventListeners() {
    addRoutineBtn.addEventListener('click', showRoutineBuilder);
    backFromBuilder.addEventListener('click', showMainScreen);
    backFromExecution.addEventListener('click', showMainScreen);
    saveRoutineBtn.addEventListener('click', saveRoutine);
    pauseResumeBtn.addEventListener('click', togglePause);
    nextPoseBtn.addEventListener('click', nextPose);
    previousPoseBtn.addEventListener('click', previousPose);
    
    // New event listeners for step-by-step flow
    nextToPosesBtn.addEventListener('click', goToPosesStep);
    cancelRoutineBtn.addEventListener('click', showMainScreen);
    backToNameBtn.addEventListener('click', goToNameStep);
    document.getElementById('poses-selection-header').addEventListener('click', togglePosesGrid);
    document.getElementById('exercises-selection-header').addEventListener('click', toggleExercisesGrid);
    closeModalBtn.addEventListener('click', hideTimeModal);
    closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDeleteRoutine);
    closeCompletionModalBtn.addEventListener('click', hideCompletionModal);
    closeCompletionBtn.addEventListener('click', hideCompletionModal);
    
    // Routine name input listener
    routineNameInput.addEventListener('input', updateNextButton);
    
    // History screen listeners
    showHistoryBtn.addEventListener('click', showHistoryScreen);
    backFromHistory.addEventListener('click', showMainScreen);
    exportHistoryBtn.addEventListener('click', exportHistory);
    importHistoryBtn.addEventListener('click', showImportHistoryModal);
    clearHistoryBtn.addEventListener('click', showClearHistoryConfirmation);
    closeClearHistoryModalBtn.addEventListener('click', hideClearHistoryModal);
    cancelClearHistoryBtn.addEventListener('click', hideClearHistoryModal);
    confirmClearHistoryBtn.addEventListener('click', confirmClearHistory);
    closeImportHistoryModalBtn.addEventListener('click', hideImportHistoryModal);
    cancelImportHistoryBtn.addEventListener('click', hideImportHistoryModal);
    confirmImportHistoryBtn.addEventListener('click', confirmImportHistory);
    closeImportSuccessModalBtn.addEventListener('click', hideImportSuccessModal);
    closeImportSuccessBtn.addEventListener('click', hideImportSuccessModal);
    
    // Rename modal listeners
    closeRenameModalBtn.addEventListener('click', hideRenameModal);
    cancelRenameBtn.addEventListener('click', hideRenameModal);
    confirmRenameBtn.addEventListener('click', confirmRenameRoutine);
    renameInput.addEventListener('input', updateRenameButton);
    renameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmRenameRoutine();
        }
    });
    
    // File input listeners
    fileInputArea.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop listeners
    fileInputArea.addEventListener('dragover', handleDragOver);
    fileInputArea.addEventListener('dragleave', handleDragLeave);
    fileInputArea.addEventListener('drop', handleFileDrop);
}

// Screen navigation
function showMainScreen() {
    hideAllScreens();
    mainScreen.classList.add('active');
    // Stop routine execution and all sounds when returning to main screen
    stopRoutineExecution();
    renderRoutines();
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
    
    // Render exercises
    renderExercises();
    
    // Show name step first
    showStep('name');
    updateNextButton();
    
    // Focus on the routine name input
    setTimeout(() => {
        routineNameInput.focus();
    }, 100);
}

function showRoutineExecution(routine) {
    hideAllScreens();
    routineExecution.classList.add('active');
    currentExecutionRoutine = routine;
    currentPoseIndex = 0;
    isPaused = false;
    
    // Clear any existing timer
    clearTimeout(timer);
    timer = null;
    
    // Reset timer display
    timerDisplay.textContent = "00:00";
    progressFill.style.width = "0%";
    
    // Reset circle progress
    const circleProgress = document.querySelector('.progress-ring-fill');
    if (circleProgress) {
        circleProgress.style.strokeDashoffset = "446";
    }
    
    // Reset pause button to show pause icon (routine is running)
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i>';
    pauseResumeBtn.setAttribute('data-state', 'running');
    
    executionRoutineName.textContent = routine.name;
    startRoutineExecution();
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
        renderRoutinePoses();
        updateSaveButton();
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

// Poses grid functions
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

// Modal functions
function showTimeModal(item) {
    // Check if it's a pose or exercise by checking the image path
    const isExercise = item.image && item.image.includes('exercise_images/');
    
    if (isExercise) {
        // It's an exercise
        selectedExercise = item;
        selectedPose = null;
        // Show repetitions section for exercises
        repetitionsSection.style.display = 'block';
        modalPoseName.textContent = `Select duration for ${item.name}`;
    } else {
        // It's a pose
        selectedPose = item;
        selectedExercise = null;
        // Hide repetitions section for poses
        repetitionsSection.style.display = 'none';
        modalPoseName.textContent = `Select time for ${item.name}`;
    }
    
    timeSelectionModal.classList.add('active');
    
    // Clear previous selections
    document.querySelectorAll('.time-option').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.repetition-option').forEach(el => el.classList.remove('selected'));
    
    // Add event listeners for repetition options
    document.querySelectorAll('.repetition-option').forEach(option => {
        option.addEventListener('click', () => selectRepetition(parseInt(option.dataset.reps)));
    });
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

function confirmDeleteRoutine() {
    if (routineToDelete) {
        // Remove routine from array
        routines = routines.filter(r => r.id !== routineToDelete.id);
        
        // Update localStorage
        localStorage.setItem('yogaRoutines', JSON.stringify(routines));
        
        // Re-render routines
        renderRoutines();
        
        // Hide modal
        hideDeleteModal();
    }
}

// Rename modal functions
function showRenameModal(routineId) {
    routineToRename = routines.find(r => r.id === routineId);
    if (routineToRename) {
        renameInput.value = routineToRename.name;
        renameModal.classList.add('active');
        renameInput.focus();
        renameInput.select();
        updateRenameButton();
    }
}

function hideRenameModal() {
    renameModal.classList.remove('active');
    routineToRename = null;
    renameInput.value = '';
}

function updateRenameButton() {
    const hasName = renameInput.value.trim().length > 0;
    const isDifferent = renameInput.value.trim() !== (routineToRename ? routineToRename.name : '');
    confirmRenameBtn.disabled = !(hasName && isDifferent);
}

function confirmRenameRoutine() {
    if (!routineToRename) return;
    
    const newName = renameInput.value.trim();
    if (!newName || newName === routineToRename.name) {
        hideRenameModal();
        return;
    }
    
    // Check if name already exists
    const nameExists = routines.some(r => r.name === newName && r.id !== routineToRename.id);
    if (nameExists) {
        alert('A routine with this name already exists. Please choose a different name.');
        return;
    }
    
    // Update routine name
    routineToRename.name = newName;
    
    // Update localStorage
    localStorage.setItem('yogaRoutines', JSON.stringify(routines));
    
    // Re-render routines
    renderRoutines();
    
    // Hide modal
    hideRenameModal();
}

// Completion modal functions
function showCompletionModal() {
    // Log routine completion
    logRoutineCompletion();
    completionModal.classList.add('active');
}

function hideCompletionModal() {
    completionModal.classList.remove('active');
    // Stop routine execution and all sounds
    stopRoutineExecution();
    showMainScreen();
    // Refresh completion log from localStorage in case it was updated
    completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
}

// Log functionality
function logRoutineCompletion() {
    // Debug: Check if currentExecutionRoutine exists
    if (!currentExecutionRoutine) {
        console.error('currentExecutionRoutine is null or undefined');
        return;
    }
    
    console.log('Logging routine completion for:', currentExecutionRoutine);
    
    const completionEntry = {
        id: Date.now(),
        routineName: currentExecutionRoutine.name,
        routineId: currentExecutionRoutine.id,
        completedAt: new Date().toISOString(),
        timestamp: Date.now(),
        duration: currentExecutionRoutine.totalDuration,
        poseCount: currentExecutionRoutine.poses.length
    };
    
    completionLog.unshift(completionEntry); // Add to beginning of array
    
    // Keep only last 100 entries to prevent storage bloat
    if (completionLog.length > 100) {
        completionLog = completionLog.slice(0, 100);
    }
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(completionLog));
    
    console.log('Routine completed and logged:', completionEntry);
    console.log('Current completion log:', completionLog);
}

function getCompletionLog() {
    return completionLog;
}

function clearCompletionLog() {
    completionLog = [];
    localStorage.removeItem('yogaCompletionLog');
}

// Clear history modal functions
function showClearHistoryConfirmation() {
    clearHistoryModal.classList.add('active');
}

function hideClearHistoryModal() {
    clearHistoryModal.classList.remove('active');
}

function confirmClearHistory() {
    clearCompletionLog();
    renderHistory();
    hideClearHistoryModal();
}

// Export history function
function exportHistory() {
    if (completionLog.length === 0) {
        alert('No history to export');
        return;
    }
    
    // Create export data with metadata
    const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        totalEntries: completionLog.length,
        history: completionLog
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `yoga-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('History exported successfully');
}

// Import history functions
function showImportHistoryModal() {
    importHistoryModal.classList.add('active');
    // Reset file input
    importFileInput.value = '';
    confirmImportHistoryBtn.disabled = true;
    updateFileInputDisplay();
}

function hideImportHistoryModal() {
    importHistoryModal.classList.remove('active');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    fileInputArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    fileInputArea.classList.remove('dragover');
}

function handleFileDrop(event) {
    event.preventDefault();
    fileInputArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (file.type !== 'application/json') {
        alert('Please select a JSON file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            validateImportData(data);
        } catch (error) {
            alert('Invalid JSON file. Please check the file format.');
            console.error('JSON parse error:', error);
        }
    };
    reader.readAsText(file);
}

function validateImportData(data) {
    if (!data.history || !Array.isArray(data.history)) {
        alert('Invalid history format. The file should contain a "history" array.');
        return;
    }
    
    // Validate history entries
    const validEntries = data.history.filter(entry => 
        entry.id && 
        entry.routineName && 
        entry.completedAt && 
        entry.duration !== undefined && 
        entry.poseCount !== undefined
    );
    
    if (validEntries.length === 0) {
        alert('No valid history entries found in the file.');
        return;
    }
    
    if (validEntries.length !== data.history.length) {
        alert(`Warning: ${data.history.length - validEntries.length} invalid entries were skipped.`);
    }
    
    // Store valid data for import
    window.pendingImportData = validEntries;
    updateFileInputDisplay(validEntries.length);
    confirmImportHistoryBtn.disabled = false;
}

function updateFileInputDisplay(entryCount = null) {
    if (entryCount !== null) {
        fileInputArea.innerHTML = `
            <div class="file-input-content">
                <div class="file-input-icon">✅</div>
                <div class="file-input-text">${entryCount} entries ready to import</div>
                <div class="file-input-hint">Click to select a different file</div>
            </div>
        `;
    } else {
        fileInputArea.innerHTML = `
            <div class="file-input-content">
                <div class="file-input-icon">📁</div>
                <div class="file-input-text">Click to select JSON file</div>
                <div class="file-input-hint">or drag and drop</div>
            </div>
        `;
    }
}

function confirmImportHistory() {
    if (!window.pendingImportData) {
        alert('No data to import');
        return;
    }
    
    // Merge with existing history (avoid duplicates by ID)
    const existingIds = new Set(completionLog.map(entry => entry.id));
    const newEntries = window.pendingImportData.filter(entry => !existingIds.has(entry.id));
    
    if (newEntries.length === 0) {
        showImportSuccessModal('All entries already exist in your history.');
        hideImportHistoryModal();
        return;
    }
    
    // Add new entries
    completionLog.unshift(...newEntries);
    
    // Sort by completion date (newest first)
    completionLog.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    // Keep only last 100 entries
    if (completionLog.length > 100) {
        completionLog.splice(100);
    }
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(completionLog));
    
    // Refresh display
    renderHistory();
    hideImportHistoryModal();
    
    // Show success modal
    showImportSuccessModal(`Successfully imported ${newEntries.length} history entries!`);
    console.log('History imported successfully:', newEntries.length, 'new entries');
}

// Import success modal functions
function showImportSuccessModal(message) {
    importSuccessText.textContent = message;
    importSuccessModal.classList.add('active');
}

function hideImportSuccessModal() {
    importSuccessModal.classList.remove('active');
}

// History rendering functions
function renderHistory() {
    console.log('Rendering history with', completionLog.length, 'entries');
    console.log('Completion log:', completionLog);
    
    // Double-check localStorage
    const storedLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    console.log('Stored in localStorage:', storedLog);
    
    renderHistoryStats();
    renderHistoryList();
}

function renderHistoryStats() {
    const totalCompletions = completionLog.length;
    const totalTime = completionLog.reduce((sum, entry) => sum + entry.duration, 0);
    const totalPoses = completionLog.reduce((sum, entry) => sum + entry.poseCount, 0);
    const uniqueRoutines = new Set(completionLog.map(entry => entry.routineName)).size;
    
    // Calculate average routines per week
    const averageRoutinesPerWeek = calculateAverageRoutinesPerWeek();
    
    // Calculate favorite routine
    const routineCounts = {};
    completionLog.forEach(entry => {
        routineCounts[entry.routineName] = (routineCounts[entry.routineName] || 0) + 1;
    });
    const favoriteRoutine = Object.keys(routineCounts).reduce((a, b) => 
        routineCounts[a] > routineCounts[b] ? a : b, 'None');
    
// Calculate longest daily streak
const longestStreak = calculateLongestStreak();
    
    historyStats.innerHTML = `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${totalCompletions}</div>
                <div class="stat-label">Completed Routines</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Math.round(totalTime / 60)}m</div>
                <div class="stat-label">Time</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${averageRoutinesPerWeek}</div>
                <div class="stat-label">Avg/Week</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${uniqueRoutines}</div>
                <div class="stat-label">Unique Routines</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${longestStreak}</div>
                <div class="stat-label">Longest Daily Streak</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${favoriteRoutine.length > 10 ? favoriteRoutine.substring(0, 10) + '...' : favoriteRoutine}</div>
                <div class="stat-label">Favorite Routine</div>
            </div>
        </div>
    `;
}

// Function to calculate average routines per week
function calculateAverageRoutinesPerWeek() {
    if (completionLog.length === 0) return 0;
    
    // Get the date range
    const dates = completionLog.map(entry => new Date(entry.completedAt));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    // Calculate weeks between first and last completion
    const timeDiff = latestDate.getTime() - earliestDate.getTime();
    const weeksDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)));
    
    // Calculate average routines per week
    const averagePerWeek = completionLog.length / weeksDiff;
    
    return Math.round(averagePerWeek * 10) / 10; // Round to 1 decimal place
}

function calculateLongestStreak() {
    if (completionLog.length === 0) return 0;
    
    // Get unique days with completions
    const completionDays = new Set();
    completionLog.forEach(entry => {
        const date = new Date(entry.completedAt);
        const dayString = date.toDateString(); // Gets "Mon Jan 01 2024" format
        completionDays.add(dayString);
    });
    
    // Convert to sorted array of dates
    const sortedDays = Array.from(completionDays)
        .map(dayString => new Date(dayString))
        .sort((a, b) => a - b);
    
    if (sortedDays.length === 0) return 0;
    if (sortedDays.length === 1) return 1;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        
        // Calculate difference in days
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
            // Consecutive day
            currentStreak++;
        } else {
            // Gap in days, reset streak
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    
    return Math.max(longestStreak, currentStreak);
}

function renderHistoryList() {
    if (completionLog.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <h3>No history yet</h3>
                <p>Complete some routines to see your progress here!</p>
            </div>
        `;
        return;
    }
    
    // Group entries by month
    const groupedEntries = {};
    completionLog.forEach(entry => {
        const date = new Date(entry.completedAt);
        const monthKey = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
        
        if (!groupedEntries[monthKey]) {
            groupedEntries[monthKey] = [];
        }
        groupedEntries[monthKey].push(entry);
    });
    
    // Sort months chronologically (newest first)
    const sortedMonths = Object.keys(groupedEntries).sort((a, b) => {
        const dateA = new Date(a + ' 1');
        const dateB = new Date(b + ' 1');
        return dateB - dateA;
    });
    
    let html = '';
    sortedMonths.forEach(month => {
        // Add month divider
        const itemCount = groupedEntries[month].length;
        html += `
            <div class="month-divider">
                <div class="month-line"></div>
                <div class="month-label clickable-month" data-month="${month}">
                    <span class="month-text">${month} (${itemCount})</span>
                </div>
                <div class="month-line"></div>
            </div>
        `;
        
        // Add entries for this month in collapsible container
        html += `<div class="month-entries" data-month="${month}">`;
        groupedEntries[month].forEach(entry => {
            const date = new Date(entry.completedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const durationMinutes = Math.round(entry.duration / 60);
            
            html += `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-routine-name">${entry.routineName}</div>
                        <div class="history-date">${formattedDate}</div>
                    </div>
                    <div class="history-details">
                        <div class="history-detail-item">
                            <span>Duration:</span>
                            <span>${durationMinutes}m</span>
                        </div>
                        <div class="history-detail-item">
                            <span>Poses:</span>
                            <span>${entry.poseCount}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
    });
    
    historyList.innerHTML = html;
    
    // Add event listeners for collapsible months
    document.querySelectorAll('.clickable-month').forEach(monthHeader => {
        monthHeader.addEventListener('click', () => {
            const month = monthHeader.dataset.month;
            const monthEntries = document.querySelector(`.month-entries[data-month="${month}"]`);
            
            if (monthEntries.style.display === 'none') {
                monthEntries.style.display = 'block';
            } else {
                monthEntries.style.display = 'none';
            }
        });
    });
}

// Render functions
function renderRoutines() {
    routinesList.innerHTML = '';
    
    if (routines.length === 0) {
        routinesList.innerHTML = '<p style="text-align: center; color: #a0aec0; font-style: italic; padding: 40px;">No routines created yet</p>';
        return;
    }
    
    routines.forEach((routine, index) => {
        const routineElement = document.createElement('div');
        routineElement.className = 'routine-item';
        routineElement.innerHTML = `
            <div class="routine-content">
                <div class="routine-name">${routine.name}</div>
                <div class="routine-duration">${formatDuration(routine.totalDuration)}</div>
            </div>
            <div class="routine-actions">
                <button class="routine-rename-btn" onclick="showRenameModal(${routine.id})" title="Rename routine"><i class="fas fa-edit"></i></button>
                <button class="routine-delete-btn" onclick="showDeleteConfirmation(${routine.id})" title="Delete routine"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Add click listener to routine element (not the action buttons)
        routineElement.addEventListener('click', (e) => {
            // Only trigger if not clicking on action buttons
            if (!e.target.closest('.routine-actions')) {
                showRoutineExecution(routine);
            }
        });
        
        // Add click listeners to action buttons to prevent event propagation
        const renameBtn = routineElement.querySelector('.routine-rename-btn');
        const deleteBtn = routineElement.querySelector('.routine-delete-btn');
        
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        routinesList.appendChild(routineElement);
    });
}

function renderPoses() {
    posesGrid.innerHTML = '';
    
    yogaPoses.forEach(pose => {
        const poseElement = document.createElement('div');
        poseElement.className = 'pose-option';
        poseElement.innerHTML = `
            <img src="${pose.image}" alt="${pose.name}">
            <div class="pose-name">${pose.name}</div>
        `;
        poseElement.addEventListener('click', () => selectPose(pose));
        posesGrid.appendChild(poseElement);
    });
}

function renderExercises() {
    exercisesGrid.innerHTML = '';
    
    exercises.forEach(exercise => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = 'exercise-option';
        exerciseElement.innerHTML = `
            <img src="${exercise.image}" alt="${exercise.name}">
            <div class="exercise-name">${exercise.name}</div>
        `;
        exerciseElement.addEventListener('click', () => selectExercise(exercise));
        exercisesGrid.appendChild(exerciseElement);
    });
}

function selectPose(pose) {
    // Remove previous selection
    document.querySelectorAll('.pose-option').forEach(el => el.classList.remove('selected'));
    
    // Select new pose
    event.target.closest('.pose-option').classList.add('selected');
    
    // Keep poses grid open and show time modal
    showTimeModal(pose);
}

function selectExercise(exercise) {
    // Remove previous selection
    document.querySelectorAll('.exercise-option').forEach(el => el.classList.remove('selected'));
    
    // Select new exercise
    event.target.closest('.exercise-option').classList.add('selected');
    
    // Keep exercises grid open and show time modal
    showTimeModal(exercise);
}

function selectTime(time) {
    // Remove previous time selection
    document.querySelectorAll('.time-option').forEach(el => el.classList.remove('selected'));
    
    // Select new time
    event.target.classList.add('selected');
    selectedTime = time;
    
    // Add pose to routine
    addPoseToRoutine();
}

function selectRepetition(reps) {
    // Remove previous repetition selection
    document.querySelectorAll('.repetition-option').forEach(el => el.classList.remove('selected'));
    
    // Select new repetition
    event.target.classList.add('selected');
    selectedTime = reps; // Use selectedTime for consistency
    
    // Add exercise to routine
    addPoseToRoutine();
}

function addPoseToRoutine() {
    if ((selectedPose || selectedExercise) && selectedTime) {
        const routineItem = selectedPose ? {
            ...selectedPose,
            duration: selectedTime,
            type: 'pose',
            unit: 'seconds'
        } : {
            ...selectedExercise,
            duration: selectedTime,
            type: 'exercise',
            unit: document.querySelector('.repetition-option.selected') ? 'reps' : 'seconds'
        };
        
        currentRoutine.push(routineItem);
        renderRoutinePoses();
        updateSaveButton();
        
        // Clear selections
        document.querySelectorAll('.pose-option').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.exercise-option').forEach(el => el.classList.remove('selected'));
        selectedPose = null;
        selectedExercise = null;
        selectedTime = null;
        
        // Hide modal
        hideTimeModal();
    }
}

function renderRoutinePoses() {
    if (currentRoutine.length === 0) {
        routinePosesList.innerHTML = '<p class="empty-message">Add poses and exercises to your routine</p>';
        return;
    }
    
    routinePosesList.innerHTML = currentRoutine.map((item, index) => {
        if (item.type === 'exercise') {
            return `
                <div class="routine-pose-item" data-index="${index}">
                    <div class="pose-info">
                        <img src="${item.image}" alt="${item.name}" class="pose-image">
                        <div class="pose-name">${item.name}</div>
                        <div class="pose-duration">${item.unit === 'reps' ? `${item.duration} reps` : formatDuration(item.duration)}</div>
                    </div>
                    <button class="delete-pose" onclick="removePoseFromRoutine(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        } else {
            return `
                <div class="routine-pose-item" data-index="${index}">
                    <div class="pose-info">
                        <img src="${item.image}" alt="${item.name}" class="pose-image">
                        <div class="pose-name">${item.name}</div>
                        <div class="pose-duration">${formatDuration(item.duration)}</div>
                    </div>
                    <button class="delete-pose" onclick="removePoseFromRoutine(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }
    }).join('');
    
    // Make poses sortable
    makeSortable();
}

function makeSortable() {
    const poseItems = document.querySelectorAll('.routine-pose-item');
    poseItems.forEach(item => {
        item.draggable = true;
        
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.index);
            item.style.opacity = '0.5';
        });
        
        item.addEventListener('dragend', (e) => {
            item.style.opacity = '1';
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetIndex = parseInt(item.dataset.index);
            
            if (draggedIndex !== targetIndex) {
                reorderPoses(draggedIndex, targetIndex);
            }
        });
    });
}

function reorderPoses(fromIndex, toIndex) {
    const pose = currentRoutine.splice(fromIndex, 1)[0];
    currentRoutine.splice(toIndex, 0, pose);
    renderRoutinePoses();
}

function removePoseFromRoutine(index) {
    currentRoutine.splice(index, 1);
    renderRoutinePoses();
    updateSaveButton();
}

function updateSaveButton() {
    const hasName = routineNameInput.value.trim().length > 0;
    const hasPoses = currentRoutine.length > 0;
    saveRoutineBtn.disabled = !(hasName && hasPoses);
}

// Save routine
function saveRoutine() {
    const name = currentRoutineName || routineNameInput.value.trim();
    if (!name || currentRoutine.length === 0) return;
    
    const totalDuration = currentRoutine.reduce((sum, pose) => sum + pose.duration, 0);
    
    const routine = {
        id: Date.now(),
        name: name,
        poses: currentRoutine,
        totalDuration: totalDuration,
        createdAt: new Date().toISOString()
    };
    
    routines.push(routine);
    localStorage.setItem('yogaRoutines', JSON.stringify(routines));
    
    showMainScreen();
}

// Routine execution
function startRoutineExecution() {
    if (!currentExecutionRoutine || currentExecutionRoutine.poses.length === 0) return;
    
    // Ensure we start from the beginning
    currentPoseIndex = 0;
    isPaused = false;
    
    // Clear any existing timer
    clearTimeout(timer);
    timer = null;
    
    showCurrentPose();
}

function showCurrentPose() {
    const pose = currentExecutionRoutine.poses[currentPoseIndex];
    currentPoseImage.src = pose.image;
    currentPoseName.textContent = pose.name;
    poseCounter.textContent = `${currentPoseIndex + 1} / ${currentExecutionRoutine.poses.length}`;
    
    // Check if this is a reps-based item
    if (pose.unit === 'reps') {
        // For reps-based items, show reps count and disable timer
        timerDisplay.textContent = `${pose.duration} reps`;
        pauseResumeBtn.style.display = 'none'; // Hide pause button for reps
        // Don't start timer for reps-based items
    } else {
        // For time-based items, show timer and enable pause button
        pauseResumeBtn.style.display = 'block'; // Show pause button for time-based
        startTimer(); // Start timer for time-based items
    }
    
    // Enable/disable previous button based on pose index
    if (currentPoseIndex > 0) {
        previousPoseBtn.disabled = false;
        previousPoseBtn.style.opacity = '1';
    } else {
        previousPoseBtn.disabled = true;
        previousPoseBtn.style.opacity = '0.5';
    }
}

function startTimer() {
    // Clear any existing timer first
    clearTimeout(timer);
    timer = null;
    
    const pose = currentExecutionRoutine.poses[currentPoseIndex];
    currentTimeLeft = pose.duration; // Initialize time left
    
    // Reset progress bar
    progressFill.style.width = "0%";
    
    // Reset circle progress
    const circleProgress = document.querySelector('.progress-ring-fill');
    if (circleProgress) {
        circleProgress.style.strokeDashoffset = "446";
    }
    
    resumeTimer();
}

function resumeTimer() {
    // Clear any existing timer first
    clearTimeout(timer);
    timer = null;
    
    const pose = currentExecutionRoutine.poses[currentPoseIndex];
    
    const updateTimer = () => {
        if (isPaused) return;
        
        const minutes = Math.floor(currentTimeLeft / 60);
        const seconds = Math.floor(currentTimeLeft % 60);
        const deciseconds = Math.floor((currentTimeLeft % 1) * 10);
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${deciseconds}`;
        
        const progress = ((pose.duration - currentTimeLeft) / pose.duration) * 100;
        progressFill.style.width = `${progress}%`;
        
        // Update circle progress
        const circleProgress = document.querySelector('.progress-ring-fill');
        if (circleProgress) {
            const circumference = 2 * Math.PI * 71; // radius = 71
            const offset = circumference - (progress / 100) * circumference;
            circleProgress.style.strokeDashoffset = offset;
        }
        
        if (currentTimeLeft <= 0) {
            autoNextPose();
            return;
        }
        
        currentTimeLeft -= 0.1;
        timer = setTimeout(updateTimer, 100);
    };
    
    updateTimer();
}

function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        // Show star icon when paused
        pauseResumeBtn.innerHTML = '<i class="fas fa-star"></i>';
        pauseResumeBtn.setAttribute('data-state', 'paused');
        // Pause timer
        clearTimeout(timer);
    } else {
        // Show pause icon when running
        pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i>';
        pauseResumeBtn.setAttribute('data-state', 'running');
        // Resume timer from where it was paused
        resumeTimer();
    }
}

function nextPose() {
    clearTimeout(timer);
    timer = null;
    
    if (currentPoseIndex < currentExecutionRoutine.poses.length - 1) {
        // Don't play sound when user manually clicks next button
        currentPoseIndex++;
        showCurrentPose(); // showCurrentPose will handle timer start for time-based items
    } else {
        // Routine completed - play bowl sound instead of bell
        playBowlSound();
        showCompletionModal();
    }
}

function autoNextPose() {
    clearTimeout(timer);
    timer = null;
    
    if (currentPoseIndex < currentExecutionRoutine.poses.length - 1) {
        // Play bell sound when timer automatically ends (not the last pose)
        playBellSound();
        currentPoseIndex++;
        showCurrentPose(); // showCurrentPose will handle timer start for time-based items
    } else {
        // Routine completed - play bowl sound instead of bell
        playBowlSound();
        showCompletionModal();
    }
}

function previousPose() {
    // Only proceed if button is enabled
    if (previousPoseBtn.disabled) return;
    
    clearTimeout(timer);
    timer = null;
    
    if (currentPoseIndex > 0) {
        currentPoseIndex--;
        showCurrentPose(); // showCurrentPose will handle timer start for time-based items
    }
}

// Utility functions
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
        return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
        return `${minutes}m`;
    } else {
        return `${minutes}m ${remainingSeconds}s`;
    }
}

// Add event listeners for time selection modal
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Add event listeners for time options in modal
    document.querySelectorAll('.time-option').forEach(option => {
        option.addEventListener('click', () => selectTime(parseInt(option.dataset.time)));
    });
});
