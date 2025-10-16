// Routine Execution Functions

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
    
    // Reset button states
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i>';
    pauseResumeBtn.setAttribute('data-state', 'running');
    pauseResumeBtn.disabled = false;
    
    // Enable/disable previous button
    previousPoseBtn.disabled = currentPoseIndex === 0;
    
    // Start the routine
    startRoutineExecution();
}

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
    console.log('Pose unit:', pose.unit, 'Duration:', pose.duration);
    if (pose.unit === 'reps') {
        // For reps-based items, show reps count and disable timer
        timerCircle.style.display = 'none'; // Hide the circle for reps
        pauseResumeBtn.style.display = 'none'; // Hide pause button for reps
        
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
        // For time-based items, show timer and hide reps display
        timerCircle.style.display = 'block';
        pauseResumeBtn.style.display = 'block';
        
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

// Completion modal functions
function showCompletionModal() {
    // Log routine completion
    logRoutineCompletion();
    
    // Update completion modal with stats
    if (currentExecutionRoutine && currentExecutionRoutine.poses) {
        // Calculate stats
        let totalReps = 0;
        let totalTimeSeconds = 0;
        
        currentExecutionRoutine.poses.forEach(pose => {
            if (pose.unit === 'reps') {
                totalReps += pose.duration;
            } else {
                totalTimeSeconds += pose.duration;
            }
        });
        
        // Format time function
        const formatTime = (seconds) => {
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        };
        
        // Update DOM elements
        const repsElement = document.getElementById('completion-reps');
        const timeElement = document.getElementById('completion-time');
        
        if (repsElement) {
            if (totalReps > 0) {
                repsElement.innerHTML = `${totalReps} Choo's <i class="fas fa-check-circle"></i>`;
                repsElement.style.display = 'block';
            } else {
                repsElement.style.display = 'none';
            }
        }
        if (timeElement) {
            if (totalTimeSeconds > 0) {
                timeElement.innerHTML = `${formatTime(totalTimeSeconds)} <i class="fas fa-check-circle"></i>`;
                timeElement.style.display = 'block';
            } else {
                timeElement.style.display = 'none';
            }
        }
        
        console.log('Completion modal updated with stats:');
        console.log('- Total reps:', totalReps);
        console.log('- Total time:', formatTime(totalTimeSeconds));
    }
    
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
    
    // Calculate reps and time stats
    let totalTime = 0;
    let totalReps = 0;
    let hasTimeItems = false;
    let hasRepsItems = false;
    
    if (currentExecutionRoutine.poses) {
        currentExecutionRoutine.poses.forEach(pose => {
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
        routineId: currentExecutionRoutine.id,
        routineName: currentExecutionRoutine.name,
        completedAt: new Date().toISOString(),
        totalTime: totalTime,
        totalReps: totalReps,
        hasTimeItems: hasTimeItems,
        hasRepsItems: hasRepsItems,
        poseCount: currentExecutionRoutine.poses ? currentExecutionRoutine.poses.length : 0,
        userId: currentUser ? currentUser.sub : null,
        userEmail: currentUser ? currentUser.email : null
    };
    
    console.log('Adding completion entry:', completionEntry);
    
    // Add to completion log
    completionLog.push(completionEntry);
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(completionLog));
    
    // Log to database if user is authenticated
    if (isAuthenticated && currentUser) {
        const detailedExercises = currentExecutionRoutine ? currentExecutionRoutine.poses : [];
        logTrainingToDatabase(completionEntry, detailedExercises);
    }
    
    console.log('Completion logged successfully. Total entries:', completionLog.length);
}

// Note: formatDuration function moved to navigation.js for better module organization
