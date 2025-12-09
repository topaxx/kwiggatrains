// Train Execution Functions

function showTrainExecution(train, fromScreen = null) {
    // Store which screen was active before starting execution
    // If fromScreen is provided, use it; otherwise detect from DOM
    if (fromScreen) {
        previousScreenBeforeExecution = fromScreen;
    } else {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            if (activeScreen.id === 'daily-activities-screen') {
                previousScreenBeforeExecution = 'daily';
            } else if (activeScreen.id === 'main-screen') {
                previousScreenBeforeExecution = 'main';
            } else {
                previousScreenBeforeExecution = 'main'; // Default to main
            }
        } else {
            previousScreenBeforeExecution = 'main'; // Default to main if no active screen
        }
    }
    
    console.log('Starting train execution from screen:', previousScreenBeforeExecution);
    
    hideAllScreens();
    trainExecution.classList.add('active');
    currentExecutionTrain = train;
    currentPoseIndex = 0;
    isPaused = false;
    
    // Clear any existing timer
    clearTimeout(timer);
    timer = null;
    
    // Reset timer display
    timerDisplay.textContent = "00:00";
    progressFill.style.width = "0%";
    
    // Ensure timer circle is visible by default when starting
    if (timerCircle) {
        timerCircle.style.display = 'block';
    }
    
    // Reset circle progress
    const circleProgress = document.querySelector('.progress-ring-fill');
    if (circleProgress) {
        circleProgress.style.strokeDashoffset = "446";
    }
    
    // Reset button states
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i>';
    pauseResumeBtn.setAttribute('data-state', 'running');
    pauseResumeBtn.disabled = false;
    
    // Hide any lingering reps display from previous trains
    const existingRepsDisplay = document.getElementById('reps-display');
    if (existingRepsDisplay) {
        existingRepsDisplay.style.display = 'none';
        existingRepsDisplay.textContent = '';
    }
    
    // Enable/disable previous button
    previousPoseBtn.disabled = currentPoseIndex === 0;
    
    // Start the train
    startTrainExecution();
}

function startTrainExecution() {
    if (!currentExecutionTrain || currentExecutionTrain.poses.length === 0) return;
    
    // Ensure we start from the beginning
    currentPoseIndex = 0;
    isPaused = false;
    
    // Clear any existing timer
    clearTimeout(timer);
    timer = null;
    
    showCurrentPose();
}

function showCurrentPose() {
    const pose = currentExecutionTrain.poses[currentPoseIndex];
    currentPoseImage.src = pose.image;
    currentPoseName.textContent = pose.name;
    poseCounter.textContent = `${currentPoseIndex + 1} / ${currentExecutionTrain.poses.length}`;
    
    // Check if this is a reps-based item
    console.log('Pose unit:', pose.unit, 'Duration:', pose.duration);
    if (pose.unit === 'reps') {
        // For reps-based items, show reps count and disable timer
        timerCircle.style.display = 'none'; // Hide the circle for reps
        pauseResumeBtn.disabled = true; // Disable pause button for reps
        pauseResumeBtn.style.opacity = '0.5'; // Make it visually disabled
        
        // Create or show reps display element
        let repsDisplay = document.getElementById('reps-display');
        if (!repsDisplay) {
            repsDisplay = document.createElement('div');
            repsDisplay.id = 'reps-display';
            repsDisplay.style.cssText = `
                font-size: 2rem;
                font-weight: 700;
                color: #667eea;
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 10px;
                border: 2px solid #667eea;
                display: flex;
                align-items: center;
                justify-content: center;
                white-space: nowrap;
            `;
            timerCircle.parentNode.insertBefore(repsDisplay, timerCircle.nextSibling);
        }
        
        repsDisplay.textContent = `${pose.duration} Choo's`;
        repsDisplay.style.display = 'block';
        
        // Enable/disable previous button
        previousPoseBtn.disabled = currentPoseIndex === 0;
        
        // For reps, we don't start a timer - user manually clicks next
        return;
    } else {
        // For time-based items, show timer and enable pause button
        timerCircle.style.display = 'block';
        pauseResumeBtn.disabled = false; // Enable pause button for time-based items
        pauseResumeBtn.style.opacity = '1'; // Make it fully visible
        
        const repsDisplay = document.getElementById('reps-display');
        if (repsDisplay) {
            repsDisplay.style.display = 'none';
        }
        
        // Enable/disable previous button
        previousPoseBtn.disabled = currentPoseIndex === 0;
        
        // Start timer for time-based poses
        startTimer();
    }
}

function startTimer() {
    // Clear any existing timer first
    clearTimeout(timer);
    timer = null;
    
    const pose = currentExecutionTrain.poses[currentPoseIndex];
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
    
    const pose = currentExecutionTrain.poses[currentPoseIndex];
    
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
    
    if (currentPoseIndex < currentExecutionTrain.poses.length - 1) {
        // Don't play sound when user manually clicks next button
        currentPoseIndex++;
        showCurrentPose(); // showCurrentPose will handle timer start for time-based items
    } else {
        // Train completed - play completion sound
        playCompletionSound();
        showCompletionModal();
    }
}

function autoNextPose() {
    clearTimeout(timer);
    timer = null;
    
    if (currentPoseIndex < currentExecutionTrain.poses.length - 1) {
        // Play bell sound when timer automatically ends (not the last pose)
        if (typeof playBellSound === 'function') {
            playBellSound();
        } else if (bellSound) {
            // Fallback: play bell sound directly if function not available
            bellSound.currentTime = 0;
            bellSound.play().catch(error => {
                console.log('Could not play bell sound:', error);
            });
        } else {
            console.warn('Bell sound not initialized');
        }
        currentPoseIndex++;
        showCurrentPose(); // showCurrentPose will handle timer start for time-based items
    } else {
        // Train completed - play completion sound
        playCompletionSound();
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

// Completion modal functions
function showCompletionModal() {
    // Log train completion
    logTrainCompletion();
    
    completionModal.classList.add('active');
}

function hideCompletionModal() {
    completionModal.classList.remove('active');
    // Stop train execution and all sounds
    stopTrainExecution();
    
    console.log('Hiding completion modal, previous screen was:', previousScreenBeforeExecution);
    
    // Verify completion was saved before navigating
    if (previousScreenBeforeExecution === 'daily' && currentExecutionTrain) {
        const today = new Date().toISOString().split('T')[0];
        const savedCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
        const trainId = typeof currentExecutionTrain.id === 'string' ? parseInt(currentExecutionTrain.id) : currentExecutionTrain.id;
        console.log('Checking saved completions for train:', trainId, 'today:', today, 'saved:', savedCompletions[today]);
    }
    
    // Return to the screen that was active before starting the train
    if (previousScreenBeforeExecution === 'daily') {
        console.log('Returning to daily activities screen');
        
        // Verify completion was saved before navigating
        if (currentExecutionTrain) {
            const today = new Date().toISOString().split('T')[0];
            const savedCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
            const trainId = typeof currentExecutionTrain.id === 'string' ? parseInt(currentExecutionTrain.id) : currentExecutionTrain.id;
            console.log('Before navigation - saved completions for today:', savedCompletions[today], 'train ID:', trainId);
        }
        
        // Small delay to ensure localStorage is written
        setTimeout(() => {
            // Return to daily activities screen and refresh it to show updated checkbox
            if (typeof window.showDailyActivitiesScreen === 'function') {
                window.showDailyActivitiesScreen();
                // Force a re-render after a short delay to ensure checkbox is updated
                setTimeout(() => {
                    if (typeof renderDailyActivities === 'function') {
                        renderDailyActivities();
                    } else if (typeof window.renderDailyActivities === 'function') {
                        window.renderDailyActivities();
                    }
                }, 200);
            } else if (typeof showDailyActivitiesScreen === 'function') {
                showDailyActivitiesScreen();
                setTimeout(() => {
                    if (typeof renderDailyActivities === 'function') {
                        renderDailyActivities();
                    }
                }, 200);
            } else {
                console.error('showDailyActivitiesScreen not available, falling back to main screen');
                showMainScreen(); // Fallback to main screen
            }
        }, 100);
    } else {
        console.log('Returning to main screen');
        // Return to main screen
        showMainScreen();
    }
    
    // Reset previous screen tracking
    previousScreenBeforeExecution = null;
    
    // Refresh completion log from localStorage in case it was updated
    completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
}

// Log functionality
function logTrainCompletion() {
    // Debug: Check if currentExecutionTrain exists
    if (!currentExecutionTrain) {
        console.error('currentExecutionTrain is null or undefined');
        return;
    }
    
    console.log('Logging train completion for:', currentExecutionTrain);
    
    // Calculate reps and time stats
    let totalTime = 0;
    let totalReps = 0;
    let hasTimeItems = false;
    let hasRepsItems = false;
    
    if (currentExecutionTrain.poses) {
        currentExecutionTrain.poses.forEach(pose => {
            if (pose.unit === 'reps') {
                totalReps += pose.duration;
                hasRepsItems = true;
            } else {
                totalTime += pose.duration;
                hasTimeItems = true;
            }
        });
    }
    
    const completionEntry = {
        id: Date.now(),
        trainId: currentExecutionTrain.id,
        trainName: currentExecutionTrain.name,
        completedAt: new Date().toISOString(),
        totalTime: totalTime,
        totalReps: totalReps,
        hasTimeItems: hasTimeItems,
        hasRepsItems: hasRepsItems,
        poseCount: currentExecutionTrain.poses ? currentExecutionTrain.poses.length : 0,
        userId: currentUser ? currentUser.sub : null,
        userEmail: currentUser ? currentUser.email : null
    };
    
    console.log('Adding completion entry:', completionEntry);
    
    // Add to completion log
    completionLog.push(completionEntry);
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(completionLog));
    
    // Update daily activities completion if train is in daily activities
    const dailyActivities = JSON.parse(localStorage.getItem('kwiggaDailyActivities') || '[]');
    // Convert train ID to number for consistent comparison
    const trainId = typeof currentExecutionTrain.id === 'string' ? parseInt(currentExecutionTrain.id) : currentExecutionTrain.id;
    
    // Check if train is in daily activities (compare as numbers)
    const isInDailyActivities = dailyActivities.some(id => {
        const numId = typeof id === 'string' ? parseInt(id) : id;
        return numId === trainId;
    });
    
    if (isInDailyActivities) {
        const today = new Date().toISOString().split('T')[0];
        let dailyActivitiesCompletions = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
        
        if (!dailyActivitiesCompletions[today]) {
            dailyActivitiesCompletions[today] = [];
        }
        
        // Check if already completed (compare as numbers)
        const alreadyCompleted = dailyActivitiesCompletions[today].some(id => {
            const numId = typeof id === 'string' ? parseInt(id) : id;
            return numId === trainId;
        });
        
        if (!alreadyCompleted) {
            dailyActivitiesCompletions[today].push(trainId);
            localStorage.setItem('kwiggaDailyActivitiesCompletions', JSON.stringify(dailyActivitiesCompletions));
            console.log('Daily activity completion updated for train:', trainId, 'completions:', dailyActivitiesCompletions[today]);
            console.log('Saved to localStorage, verifying...');
            // Verify it was saved
            const verify = JSON.parse(localStorage.getItem('kwiggaDailyActivitiesCompletions') || '{}');
            console.log('Verification - saved completions:', verify[today]);
        } else {
            console.log('Train already marked as completed:', trainId);
        }
    } else {
        console.log('Train not in daily activities:', trainId, 'daily activities:', dailyActivities);
    }
    
    // Log to database if user is authenticated
    if (isAuthenticated && currentUser) {
        const detailedExercises = currentExecutionTrain ? currentExecutionTrain.poses : [];
        logTrainingToDatabase(completionEntry, detailedExercises);
    }
    
    console.log('Completion logged successfully. Total entries:', completionLog.length);
}

// Make showTrainExecution globally available
window.showTrainExecution = showTrainExecution;

// Note: formatDuration function moved to navigation.js for better module organization
