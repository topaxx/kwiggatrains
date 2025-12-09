// Daily Activities Management Functions

// Show daily activities screen
function showDailyActivitiesScreen() {
    hideAllScreens();
    dailyActivitiesScreen.classList.add('active');
    stopTrainExecution();
    // Load data from localStorage - reload to get latest completion status
    dailyActivities = JSON.parse(localStorage.getItem('kwiggaDailyActivities') || '[]');
    dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    
    console.log('Showing daily activities screen, completions:', dailyActivitiesCompletions);
    
    renderDailyActivities();
    setupDailyActivitiesEventDelegation();
    window.scrollTo(0, 0);
}

// Setup event delegation for daily activities remove buttons
function setupDailyActivitiesEventDelegation() {
    // Get reference to daily activities list
    const list = document.getElementById('daily-activities-list');
    if (list) {
        // Add event delegation listener (using capture phase to ensure it fires)
        list.addEventListener('click', handleDailyActivitiesListClick, true);
    }
}

// Handle clicks on daily activities list (event delegation)
function handleDailyActivitiesListClick(event) {
    // Check if clicked on remove button or its icon
    const removeBtn = event.target.closest('.daily-activity-remove-btn');
    if (removeBtn) {
        event.preventDefault();
        event.stopPropagation();
        
        // Get train ID from the parent item
        const activityItem = removeBtn.closest('.daily-activity-item');
        if (activityItem) {
            const trainId = activityItem.getAttribute('data-train-id');
            if (trainId) {
                const trainIdNum = typeof trainId === 'string' ? parseInt(trainId) : trainId;
                console.log('Remove button clicked for train ID:', trainIdNum);
                
                // Show confirmation modal
                if (typeof window.showRemoveDailyActivityConfirmation === 'function') {
                    window.showRemoveDailyActivityConfirmation(trainIdNum);
                } else if (typeof showRemoveDailyActivityConfirmation === 'function') {
                    showRemoveDailyActivityConfirmation(trainIdNum);
                } else {
                    console.error('showRemoveDailyActivityConfirmation function not available');
                }
                return;
            }
        }
    }
}

// Make showDailyActivitiesScreen globally available
window.showDailyActivitiesScreen = showDailyActivitiesScreen;
// Make renderDailyActivities globally available
window.renderDailyActivities = renderDailyActivities;

// Render daily activities list
function renderDailyActivities() {
    if (!dailyActivitiesList) {
        console.error('daily-activities-list element not found');
        return;
    }

    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's completions FIRST before reset check to preserve any just-completed trains
    dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    const todayCompletionsBeforeReset = dailyActivitiesCompletions[today] || [];
    
    // Check if we need to reset completions based on the last daily activities completion log
    // BUT only if we're not coming back from a train completion (check completion log for recent entries)
    const completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    const recentCompletions = completionLog.filter(entry => {
        const entryDate = new Date(entry.completedAt).toISOString().split('T')[0];
        return entryDate === today;
    });
    
    // Only reset if there are no recent completions today (to avoid resetting right after completing a train)
    // Also check if there are completions in todayCompletionsBeforeReset - if so, don't reset
    if (recentCompletions.length === 0 && todayCompletionsBeforeReset.length === 0) {
        resetDailyActivitiesIfNewDay();
    } else {
        console.log('Skipping reset - recent completions found for today:', recentCompletions.length, 'or completions already exist:', todayCompletionsBeforeReset.length);
    }
    
    // Get today's completions (after potential reset) - reload from localStorage to ensure latest data
    dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    const todayCompletions = dailyActivitiesCompletions[today] || [];
    
    console.log('Rendering daily activities, today:', today, 'completions before reset:', todayCompletionsBeforeReset, 'completions after reset:', todayCompletions);

    // Load trains from localStorage
    trains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');

    if (dailyActivities.length === 0) {
        dailyActivitiesList.innerHTML = '<p class="empty-message">No trains added to daily activities yet. Click "Add Train" to get started!</p>';
        return;
    }

    // Check if all activities are completed
    const validTrains = dailyActivities.filter(trainId => {
        return trains.find(t => t.id === trainId);
    });
    
    const allCompleted = validTrains.length > 0 && validTrains.every(trainId => {
        return todayCompletions.includes(trainId);
    });
    
    let html = '';
    
    // Show completion message if all activities are completed
    if (allCompleted && validTrains.length > 0) {
        const todayDate = new Date();
        const formattedDate = todayDate.toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        html += `
            <div class="daily-activities-completed-message">
                <div class="completed-icon">✓</div>
                <div class="completed-text">
                    <div class="completed-title">Daily Activities Voltooid</div>
                    <div class="completed-date">${formattedDate}</div>
                </div>
            </div>
        `;
        
        // Log daily activities completion
        logDailyActivitiesCompletion(validTrains);
    }
    
    dailyActivities.forEach(trainId => {
        const train = trains.find(t => t.id === trainId);
        
        if (!train) {
            // Train was deleted, skip it
            return;
        }

        // Check if this train is completed today (compare as numbers for consistency)
        const trainIdNum = typeof trainId === 'string' ? parseInt(trainId) : trainId;
        const trainIdFromTrain = typeof train.id === 'string' ? parseInt(train.id) : train.id;
        
        // Use train.id directly since we're already working with the train object
        const isCompleted = todayCompletions.some(id => {
            const numId = typeof id === 'string' ? parseInt(id) : id;
            return numId === trainIdFromTrain;
        });
        
        console.log('Train:', train.name, 'train.id:', train.id, 'trainIdFromTrain:', trainIdFromTrain, 'isCompleted:', isCompleted, 'todayCompletions:', todayCompletions);
        
        // Calculate train stats
        let totalTime = 0;
        let totalReps = 0;
        let hasTimeItems = false;
        let hasRepsItems = false;

        train.poses.forEach(item => {
            if (item.type === 'exercise' && item.unit === 'reps') {
                totalReps += item.duration || 0;
                hasRepsItems = true;
            } else {
                totalTime += item.duration || 0;
                hasTimeItems = true;
            }
        });

        let displayText = '';
        if (hasTimeItems && hasRepsItems) {
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            displayText = `${minutes}:${seconds.toString().padStart(2, '0')} + ${totalReps} reps`;
        } else if (hasRepsItems) {
            displayText = `${totalReps} reps`;
        } else {
            const minutes = Math.floor(totalTime / 60);
            const seconds = totalTime % 60;
            displayText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        html += `
            <div class="daily-activity-item" data-train-id="${train.id}" onclick="handleDailyActivityClick(event, ${train.id})">
                <input type="checkbox" 
                       class="daily-activity-checkbox" 
                       data-train-id="${train.id}"
                       ${isCompleted ? 'checked="checked"' : ''}
                       onchange="toggleDailyActivityCompletion(${train.id})">
                <div class="daily-activity-content">
                    <div class="daily-activity-name">${train.name}</div>
                    <div class="daily-activity-duration">${displayText}</div>
                </div>
                <button class="daily-activity-remove-btn" title="Remove from daily activities">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });

    dailyActivitiesList.innerHTML = html;
}

// Toggle completion status for a train
function toggleDailyActivityCompletion(trainId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize today's completions if it doesn't exist
    if (!dailyActivitiesCompletions[today]) {
        dailyActivitiesCompletions[today] = [];
    }

    const checkbox = document.querySelector(`.daily-activity-checkbox[data-train-id="${trainId}"]`);
    const isChecked = checkbox ? checkbox.checked : false;

    if (isChecked) {
        // Add to completions if not already there
        if (!dailyActivitiesCompletions[today].includes(trainId)) {
            dailyActivitiesCompletions[today].push(trainId);
        }
    } else {
        // Remove from completions
        dailyActivitiesCompletions[today] = dailyActivitiesCompletions[today].filter(id => id !== trainId);
    }

    // Save to localStorage
    localStorage.setItem('kwiggaDailyActivitiesCompletions', JSON.stringify(dailyActivitiesCompletions));
    
    // Re-render to update completion message if needed
    renderDailyActivities();
}

// Make toggleDailyActivityCompletion globally available
window.toggleDailyActivityCompletion = toggleDailyActivityCompletion;

// Handle click on daily activity item (make entire item clickable)
function handleDailyActivityClick(event, trainId) {
    // Don't trigger if clicking on the remove button
    if (event.target.closest('.daily-activity-remove-btn')) {
        return;
    }
    
    // Don't trigger if clicking directly on the checkbox (it has its own handler)
    if (event.target.classList.contains('daily-activity-checkbox')) {
        return;
    }
    
    // Start train execution - load trains from localStorage to ensure we have the latest data
    const allTrains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
    const train = allTrains.find(t => t.id === trainId);
    if (train) {
        // Check if showTrainExecution is available (from train-execution.js)
        // Pass 'daily' as the fromScreen parameter to indicate we're starting from daily activities
        if (typeof showTrainExecution === 'function') {
            showTrainExecution(train, 'daily');
        } else if (typeof window.showTrainExecution === 'function') {
            window.showTrainExecution(train, 'daily');
        } else {
            console.error('showTrainExecution function not available');
        }
    } else {
        console.error('Train not found with id:', trainId);
    }
}

// Make handleDailyActivityClick globally available
window.handleDailyActivityClick = handleDailyActivityClick;

// Reset daily activities completions for today
function resetDailyActivities() {
    const today = new Date().toISOString().split('T')[0];
    let completions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    
    // Reset today's completions
    completions[today] = [];
    localStorage.setItem('kwiggaDailyActivitiesCompletions', JSON.stringify(completions));
    
    // Update global variable
    dailyActivitiesCompletions = completions;
    
    // Re-render to show updated checkboxes
    renderDailyActivities();
    
    console.log('Daily activities reset for today:', today);
}

// Make resetDailyActivities globally available
window.resetDailyActivities = resetDailyActivities;

// Reset daily activities completions if it's a new day since the last completion log
function resetDailyActivitiesIfNewDay() {
    const today = new Date().toISOString().split('T')[0];
    
    // Load completion log to find the last daily activities completion
    const completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    
    // Find the most recent daily activities completion entry
    const dailyActivityCompletions = completionLog
        .filter(entry => entry.dailyActivitiesCompleted)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    
    // Load current completions
    let completions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    const todayCompletions = completions[today] || [];
    
    // Check if there's a completion log for today
    const hasCompletionLogForToday = completionLog.some(entry => {
        if (!entry.dailyActivitiesCompleted) return false;
        const entryDate = new Date(entry.completedAt).toISOString().split('T')[0];
        return entryDate === today;
    });
    
    // If there's already a completion log for today, don't reset
    if (hasCompletionLogForToday) {
        return;
    }
    
    // If there's no previous completion log, check if there are any regular train completions for today
    // If there are, don't reset (user might have just completed a train)
    const todayRegularCompletions = completionLog.filter(entry => {
        if (entry.dailyActivitiesCompleted) return false; // Skip daily activities completions
        const entryDate = new Date(entry.completedAt).toISOString().split('T')[0];
        return entryDate === today;
    });
    
    if (dailyActivityCompletions.length === 0) {
        // Only reset if there are completions for today AND no regular completions today
        // This prevents resetting right after completing a train
        if (todayCompletions.length > 0 && todayRegularCompletions.length === 0) {
            completions[today] = [];
            localStorage.setItem('kwiggaDailyActivitiesCompletions', JSON.stringify(completions));
            console.log('Daily activities completions reset - no previous completion log and no regular completions today');
        } else if (todayCompletions.length > 0 && todayRegularCompletions.length > 0) {
            console.log('Keeping completions - regular train completions found for today:', todayRegularCompletions.length);
        }
        return;
    }
    
    // Get the date of the last completion log
    const lastCompletion = dailyActivityCompletions[0];
    const lastCompletionDate = new Date(lastCompletion.completedAt).toISOString().split('T')[0];
    
    // If it's a new day since the last completion, reset today's completions
    if (lastCompletionDate < today) {
        // New day - reset completions for today if they exist
        if (todayCompletions.length > 0) {
            completions[today] = [];
            localStorage.setItem('kwiggaDailyActivitiesCompletions', JSON.stringify(completions));
            console.log('Daily activities completions reset for new day (last completion was on', lastCompletionDate + ')');
        }
    }
}

// Show confirmation modal before removing train from daily activities
function showRemoveDailyActivityConfirmation(trainId) {
    console.log('showRemoveDailyActivityConfirmation called with trainId:', trainId);
    
    // Load trains to get the train name
    const allTrains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
    const train = allTrains.find(t => {
        const trainIdNum = typeof t.id === 'string' ? parseInt(t.id) : t.id;
        const searchIdNum = typeof trainId === 'string' ? parseInt(trainId) : trainId;
        return trainIdNum === searchIdNum;
    });
    
    if (train) {
        // Store the train ID to remove
        window.trainToRemoveFromDaily = trainId;
        
        // Update confirmation text - just show the train name
        const confirmationText = document.getElementById('remove-daily-activity-confirmation-text');
        if (confirmationText) {
            confirmationText.innerHTML = `<strong>${train.name}</strong>`;
        } else {
            console.error('remove-daily-activity-confirmation-text element not found');
        }
        
        // Show modal
        const modal = document.getElementById('remove-daily-activity-modal');
        if (modal) {
            modal.classList.add('active');
            console.log('Modal shown');
        } else {
            console.error('remove-daily-activity-modal element not found');
        }
    } else {
        console.error('Train not found with id:', trainId);
    }
}

// Hide remove daily activity confirmation modal
function hideRemoveDailyActivityModal() {
    const modal = document.getElementById('remove-daily-activity-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    window.trainToRemoveFromDaily = null;
}

// Remove train from daily activities (called after confirmation)
function removeTrainFromDailyActivitiesInternal(trainId) {
    console.log('Removing train from daily activities:', trainId);
    // Convert IDs to numbers for consistent comparison
    const trainIdNum = typeof trainId === 'string' ? parseInt(trainId) : trainId;
    dailyActivities = dailyActivities.filter(id => {
        const idNum = typeof id === 'string' ? parseInt(id) : id;
        return idNum !== trainIdNum;
    });
    localStorage.setItem('kwiggaDailyActivities', JSON.stringify(dailyActivities));
    renderDailyActivities();
    hideRemoveDailyActivityModal();
}

// Confirm remove daily activity
function confirmRemoveDailyActivity() {
    if (window.trainToRemoveFromDaily !== null && window.trainToRemoveFromDaily !== undefined) {
        removeTrainFromDailyActivitiesInternal(window.trainToRemoveFromDaily);
    }
}

// Make functions globally available
window.showRemoveDailyActivityConfirmation = showRemoveDailyActivityConfirmation;
window.hideRemoveDailyActivityModal = hideRemoveDailyActivityModal;
window.confirmRemoveDailyActivity = confirmRemoveDailyActivity;

// Show add train modal
function showAddTrainDailyActivitiesModal() {
    if (!addTrainDailyActivitiesModal) {
        console.error('add-train-daily-activities-modal element not found');
        return;
    }

    loadTrainsIntoDailyActivitiesDropdown();
    addTrainDailyActivitiesModal.classList.add('active');
}

// Hide add train modal
function hideAddTrainDailyActivitiesModal() {
    if (addTrainDailyActivitiesModal) {
        addTrainDailyActivitiesModal.classList.remove('active');
    }
    if (selectTrainDailyActivitiesDropdown) {
        selectTrainDailyActivitiesDropdown.value = '';
    }
    updateAddTrainDailyActivitiesButtonState();
}

// Load trains into dropdown (excluding already added trains)
function loadTrainsIntoDailyActivitiesDropdown() {
    if (!selectTrainDailyActivitiesDropdown) return;
    
    // Clear existing options
    selectTrainDailyActivitiesDropdown.innerHTML = '<option value="">-- Select a train --</option>';
    
    // Load trains from localStorage
    const savedTrains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
    
    // Filter out trains that are already in daily activities
    const availableTrains = savedTrains.filter(train => !dailyActivities.includes(train.id));
    
    if (availableTrains.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No trains available or all trains already added';
        option.disabled = true;
        selectTrainDailyActivitiesDropdown.appendChild(option);
        return;
    }
    
    // Add each train as an option
    availableTrains.forEach(train => {
        const option = document.createElement('option');
        option.value = train.id;
        option.textContent = train.name || `Train #${train.id}`;
        selectTrainDailyActivitiesDropdown.appendChild(option);
    });
}

// Confirm adding train to daily activities
function confirmAddTrainToDailyActivities() {
    const selectedTrainId = parseInt(selectTrainDailyActivitiesDropdown.value);
    
    if (!selectedTrainId) {
        console.error('No train selected');
        return;
    }

    // Check if train is already in daily activities
    if (dailyActivities.includes(selectedTrainId)) {
        console.warn('Train already in daily activities');
        hideAddTrainDailyActivitiesModal();
        return;
    }

    // Add train to daily activities
    dailyActivities.push(selectedTrainId);
    localStorage.setItem('kwiggaDailyActivities', JSON.stringify(dailyActivities));

    // Hide modal and re-render
    hideAddTrainDailyActivitiesModal();
    renderDailyActivities();
}

// Update button state based on selection
function updateAddTrainDailyActivitiesButtonState() {
    if (!selectTrainDailyActivitiesDropdown || !confirmAddTrainDailyActivitiesBtn) return;
    
    const hasTrain = selectTrainDailyActivitiesDropdown.value !== '';
    confirmAddTrainDailyActivitiesBtn.disabled = !hasTrain;
}

// Log daily activities completion
function logDailyActivitiesCompletion(completedTrainIds) {
    const today = new Date().toISOString().split('T')[0];
    
    // Reload completion log from localStorage to ensure we have the latest
    let localCompletionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    
    // Check if we already logged completion for today
    const todayISO = new Date().toISOString();
    const todayStart = new Date(todayISO.split('T')[0] + 'T00:00:00.000Z').toISOString();
    const todayEnd = new Date(todayISO.split('T')[0] + 'T23:59:59.999Z').toISOString();
    
    // Check if we already have a daily activities completion log for today
    const existingLog = localCompletionLog.find(entry => {
        if (!entry.dailyActivitiesCompleted) return false;
        const entryDate = new Date(entry.completedAt);
        return entryDate >= new Date(todayStart) && entryDate <= new Date(todayEnd);
    });
    
    if (existingLog) {
        console.log('Daily activities completion already logged for today');
        return;
    }
    
    // Load trains from localStorage
    const trains = JSON.parse(localStorage.getItem('kwiggaTrains') || '[]');
    
    // Calculate total stats from all completed trains
    let totalTime = 0;
    let totalReps = 0;
    let totalPoseCount = 0;
    let hasTimeItems = false;
    let hasRepsItems = false;
    const trainNames = [];
    
    completedTrainIds.forEach(trainId => {
        const train = trains.find(t => t.id === trainId);
        if (train) {
            trainNames.push(train.name);
            
            if (train.poses) {
                train.poses.forEach(item => {
                    if (item.type === 'exercise' && item.unit === 'reps') {
                        totalReps += item.duration || 0;
                        hasRepsItems = true;
                    } else {
                        totalTime += item.duration || 0;
                        hasTimeItems = true;
                    }
                    totalPoseCount++;
                });
            }
        }
    });
    
    // Create completion entry for daily activities
    const completionEntry = {
        id: Date.now(),
        trainId: null, // No single train ID for daily activities
        trainName: `Daily Activities (${trainNames.join(', ')})`,
        completedAt: new Date().toISOString(),
        totalTime: totalTime,
        totalReps: totalReps,
        hasTimeItems: hasTimeItems,
        hasRepsItems: hasRepsItems,
        poseCount: totalPoseCount,
        userId: typeof currentUser !== 'undefined' && currentUser ? currentUser.sub : null,
        userEmail: typeof currentUser !== 'undefined' && currentUser ? currentUser.email : null,
        dailyActivitiesCompleted: true,
        completedTrainIds: completedTrainIds,
        completedTrainNames: trainNames
    };
    
    console.log('Adding daily activities completion entry:', completionEntry);
    
    // Add to completion log
    localCompletionLog.push(completionEntry);
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(localCompletionLog));
    
    // Update global completionLog variable if it exists
    if (typeof completionLog !== 'undefined') {
        completionLog = localCompletionLog;
    }
    
    // Log to database if user is authenticated
    if (typeof isAuthenticated !== 'undefined' && isAuthenticated && typeof currentUser !== 'undefined' && currentUser) {
        if (typeof logTrainingToDatabase === 'function') {
            logTrainingToDatabase(completionEntry, []);
        }
    }
    
    console.log('Daily activities completion logged successfully');
}

// Make functions globally available
window.showAddTrainDailyActivitiesModal = showAddTrainDailyActivitiesModal;
window.hideAddTrainDailyActivitiesModal = hideAddTrainDailyActivitiesModal;
window.confirmAddTrainToDailyActivities = confirmAddTrainToDailyActivities;
window.updateAddTrainDailyActivitiesButtonState = updateAddTrainDailyActivitiesButtonState;

