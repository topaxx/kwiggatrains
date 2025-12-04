// Daily Activities Management Functions

// Show daily activities screen
function showDailyActivitiesScreen() {
    hideAllScreens();
    dailyActivitiesScreen.classList.add('active');
    stopTrainExecution();
    // Load data from localStorage
    dailyActivities = JSON.parse(localStorage.getItem('kwiggaDailyActivities') || '[]');
    dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
    renderDailyActivities();
    window.scrollTo(0, 0);
}

// Make showDailyActivitiesScreen globally available
window.showDailyActivitiesScreen = showDailyActivitiesScreen;

// Render daily activities list
function renderDailyActivities() {
    if (!dailyActivitiesList) {
        console.error('daily-activities-list element not found');
        return;
    }

    // Get today's date string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's completions
    const todayCompletions = dailyActivitiesCompletions[today] || [];

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

        // Check if this train is completed today
        const isCompleted = todayCompletions.includes(trainId);
        
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
                       ${isCompleted ? 'checked' : ''}
                       onchange="toggleDailyActivityCompletion(${train.id})">
                <div class="daily-activity-content">
                    <div class="daily-activity-name">${train.name}</div>
                    <div class="daily-activity-duration">${displayText}</div>
                </div>
                <button class="daily-activity-remove-btn" onclick="event.stopPropagation(); removeTrainFromDailyActivities(${train.id})" title="Remove from daily activities">
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
    
    // Toggle the checkbox
    const checkbox = document.querySelector(`.daily-activity-checkbox[data-train-id="${trainId}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        toggleDailyActivityCompletion(trainId);
    }
}

// Make handleDailyActivityClick globally available
window.handleDailyActivityClick = handleDailyActivityClick;

// Remove train from daily activities
function removeTrainFromDailyActivities(trainId) {
    dailyActivities = dailyActivities.filter(id => id !== trainId);
    localStorage.setItem('kwiggaDailyActivities', JSON.stringify(dailyActivities));
    renderDailyActivities();
}

// Make removeTrainFromDailyActivities globally available
window.removeTrainFromDailyActivities = removeTrainFromDailyActivities;

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

