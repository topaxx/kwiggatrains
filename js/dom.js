// DOM elements - Main screens
const mainScreen = document.getElementById('main-screen');
const trainBuilder = document.getElementById('train-builder');
const trainExecution = document.getElementById('train-execution');
const historyScreen = document.getElementById('history-screen');
const trainsList = document.getElementById('trains-list');
const addTrainBtn = document.getElementById('add-train-btn');
const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const showHistoryBtn = document.getElementById('show-history-btn');
const showDailyActivitiesBtn = document.getElementById('show-daily-activities-btn');
const backFromBuilder = document.getElementById('back-from-builder');
const backFromExecution = document.getElementById('back-from-execution');
const backFromHistory = document.getElementById('back-from-history');
const backFromSettings = document.getElementById('back-from-settings');
const settingsScreen = document.getElementById('settings-screen');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const trainNameInput = document.getElementById('train-name-input');
const posesGrid = document.getElementById('poses-grid');
const exercisesGrid = document.getElementById('exercises-grid');
const trainPosesList = document.getElementById('train-poses-list');
const saveTrainBtn = document.getElementById('save-train-btn');
const currentPoseImage = document.getElementById('current-pose-image');
const currentPoseName = document.getElementById('current-pose-name');
const timerDisplay = document.getElementById('timer-display');
const timerCircle = document.querySelector('.timer-circle');
const progressFill = document.getElementById('progress-fill');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const nextPoseBtn = document.getElementById('next-pose-btn');
const previousPoseBtn = document.getElementById('previous-pose-btn');
const poseCounter = document.getElementById('pose-counter');

// New DOM elements for step-by-step flow
const nameStep = document.getElementById('name-step');
const posesStep = document.getElementById('poses-step');
const nextToPosesBtn = document.getElementById('next-to-poses');
const cancelTrainBtn = document.getElementById('cancel-train');
const backToNameBtn = document.getElementById('back-to-name');
const posesGridContainer = document.getElementById('poses-grid-container');
const exercisesGridContainer = document.getElementById('exercises-grid-container');
const togglePosesGridBtn = document.getElementById('toggle-poses-grid');
const toggleActivitiesGridBtn = document.getElementById('toggle-activities-grid');
const toggleExercisesGridBtn = document.getElementById('toggle-exercises-grid');
const toggleIcon = document.getElementById('toggle-icon');
const toggleActivitiesIcon = document.getElementById('toggle-activities-icon');
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

// Delete error modal elements
const deleteErrorModal = document.getElementById('delete-error-modal');
const deleteErrorText = document.getElementById('delete-error-text');
const closeDeleteErrorBtn = document.getElementById('close-delete-error-modal');
const okDeleteErrorBtn = document.getElementById('ok-delete-error');

const completionModal = document.getElementById('completion-modal');
const closeCompletionModalBtn = document.getElementById('close-completion-modal');
const closeCompletionBtn = document.getElementById('close-completion');
const completionText = document.getElementById('completion-text');
const historyStats = document.getElementById('history-stats');
const historyList = document.getElementById('history-list');
const toggleLocalBtn = document.getElementById('toggle-local');
const toggleDatabaseBtn = document.getElementById('toggle-database');
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

// Import error modal elements
const importErrorModal = document.getElementById('import-error-modal');
const importErrorText = document.getElementById('import-error-text');
const closeImportErrorBtn = document.getElementById('close-import-error-modal');
const okImportErrorBtn = document.getElementById('ok-import-error');

const renameModal = document.getElementById('rename-modal');
const closeRenameModalBtn = document.getElementById('close-rename-modal');
const cancelRenameBtn = document.getElementById('cancel-rename');
const confirmRenameBtn = document.getElementById('confirm-rename');
const renameInput = document.getElementById('rename-input');

// Authentication DOM elements
const userModal = document.getElementById('user-modal');
const closeUserModalBtn = document.getElementById('close-user-modal');
const userModalTitle = document.getElementById('user-modal-title');
const loginContent = document.getElementById('login-content');
const userContent = document.getElementById('user-content');
const twitterLoginBtn = document.getElementById('twitter-login-btn');
const userAvatarImg = document.getElementById('user-avatar-img');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

// User ID Modal elements
const useridModal = document.getElementById('userid-modal');
const closeUseridModalBtn = document.getElementById('close-userid-modal');
const closeUseridBtn = document.getElementById('close-userid');
const useridAvatarImg = document.getElementById('userid-avatar-img');
const useridName = document.getElementById('userid-name');
const useridEmail = document.getElementById('userid-email');
const useridDisplay = document.getElementById('userid-display');

// Settings screen authentication elements
const settingsLoginContent = document.getElementById('settings-login-content');
const settingsUserContent = document.getElementById('settings-user-content');
const settingsTwitterLoginBtn = document.getElementById('settings-twitter-login-btn');
const settingsUserAvatarImg = document.getElementById('settings-user-avatar-img');
const settingsUserName = document.getElementById('settings-user-name');
const settingsUserEmail = document.getElementById('settings-user-email');
const settingsLogoutBtn = document.getElementById('settings-logout-btn');

// Logout success modal elements
const logoutSuccessModal = document.getElementById('logout-success-modal');
const closeLogoutSuccessBtn = document.getElementById('close-logout-success');
const logoutSuccessText = document.getElementById('logout-success-text');

// Add train to history modal elements
const addTrainHistoryModal = document.getElementById('add-train-history-modal');
const addTrainHistoryBtn = document.getElementById('add-train-history-btn');
const closeAddTrainHistoryModalBtn = document.getElementById('close-add-train-history-modal');
const cancelAddTrainHistoryBtn = document.getElementById('cancel-add-train-history');
const confirmAddTrainHistoryBtn = document.getElementById('confirm-add-train-history');
const selectTrainDropdown = document.getElementById('select-train-dropdown');
const completionDateInput = document.getElementById('completion-date-input');

// Group management elements
const createGroupBtn = document.getElementById('create-group-btn');
const createGroupModal = document.getElementById('create-group-modal');
const closeCreateGroupModalBtn = document.getElementById('close-create-group-modal');
const cancelCreateGroupBtn = document.getElementById('cancel-create-group');
const confirmCreateGroupBtn = document.getElementById('confirm-create-group');
const groupNameInput = document.getElementById('group-name-input');
const manageGroupModal = document.getElementById('manage-group-modal');
const closeManageGroupModalBtn = document.getElementById('close-manage-group-modal');
const cancelManageGroupBtn = document.getElementById('cancel-manage-group');
const saveManageGroupBtn = document.getElementById('save-manage-group');
const manageGroupNameInput = document.getElementById('manage-group-name-input');
const groupTrainsList = document.getElementById('group-trains-list');
const addTrainToGroupDropdown = document.getElementById('add-train-to-group-dropdown');
const deleteGroupBtn = document.getElementById('delete-group-btn');

// Daily Activities DOM elements
const dailyActivitiesScreen = document.getElementById('daily-activities-screen');
const backFromDailyActivities = document.getElementById('back-from-daily-activities');
const dailyActivitiesList = document.getElementById('daily-activities-list');
const addTrainDailyActivitiesBtn = document.getElementById('add-train-daily-activities-btn');
const resetDailyActivitiesBtn = document.getElementById('reset-daily-activities-btn');
const addTrainDailyActivitiesModal = document.getElementById('add-train-daily-activities-modal');
const closeAddTrainDailyActivitiesModalBtn = document.getElementById('close-add-train-daily-activities-modal');
const cancelAddTrainDailyActivitiesBtn = document.getElementById('cancel-add-train-daily-activities');
const confirmAddTrainDailyActivitiesBtn = document.getElementById('confirm-add-train-daily-activities');
const removeDailyActivityModal = document.getElementById('remove-daily-activity-modal');
const closeRemoveDailyActivityModalBtn = document.getElementById('close-remove-daily-activity-modal');
const cancelRemoveDailyActivityBtn = document.getElementById('cancel-remove-daily-activity');
const confirmRemoveDailyActivityBtn = document.getElementById('confirm-remove-daily-activity');
const selectTrainDailyActivitiesDropdown = document.getElementById('select-train-daily-activities-dropdown');