// Main Application Bootstrap

// Initialize app
function init() {
    initBellSound();
    initBowlSound();
    initAuthentication();
    renderRoutines();
    renderPoses();
    renderActivities();
    renderExercises();
    setupEventListeners();
}

// Event listeners
function setupEventListeners() {
    addRoutineBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
        showRoutineBuilder();
    });
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
    document.getElementById('activities-selection-header').addEventListener('click', toggleActivitiesGrid);
    document.getElementById('exercises-selection-header').addEventListener('click', toggleExercisesGrid);
    closeModalBtn.addEventListener('click', hideTimeModal);
    closeDeleteModalBtn.addEventListener('click', hideDeleteModal);
    cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDeleteRoutine);
    closeCompletionModalBtn.addEventListener('click', hideCompletionModal);
    closeCompletionBtn.addEventListener('click', hideCompletionModal);
    
    // Routine name input listener
    routineNameInput.addEventListener('input', updateNextButton);
    
    // Settings and History screen listeners
    settingsBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
        showSettingsScreen();
    });
    showHistoryBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
        showHistoryScreen();
    });
    backFromHistory.addEventListener('click', showMainScreen);
    backFromSettings.addEventListener('click', showMainScreen);
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
    
    // Settings screen login listeners
    settingsTwitterLoginBtn.addEventListener('click', handleTwitterLogin);
    settingsLogoutBtn.addEventListener('click', handleLogout);
    
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
    
    // Add event listeners for time options in modal
    document.querySelectorAll('.time-option').forEach(option => {
        option.addEventListener('click', () => selectTime(parseInt(option.dataset.time), option));
    });
    
    // Add event listeners for repetition options in modal
    document.querySelectorAll('.repetition-option').forEach(option => {
        option.addEventListener('click', () => selectRepetition(parseInt(option.dataset.reps), option));
    });
});
