// Routine Builder Functions

// Rendering functions
function renderRoutines() {
    const loadingIndicator = document.getElementById('routines-loading');
    const routinesContainer = document.getElementById('routines-list');
    
    // Show loading indicator
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (routinesContainer) routinesContainer.style.display = 'none';
    
    // Simulate loading delay for better UX (only if routines exist)
    const loadingDelay = routines.length > 0 ? 300 : 0;
    
    setTimeout(() => {
        // Hide loading, show content
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (routinesContainer) routinesContainer.style.display = 'block';
        
        routinesList.innerHTML = '';
        
        if (routines.length === 0) {
            routinesList.innerHTML = '<p style="text-align: center; color: #a0aec0; font-style: italic; padding: 40px;">No routines created yet</p>';
            return;
        }
    
    routines.forEach((routine, index) => {
        // Calculate stats for the routine
        let totalTime = 0;
        let totalReps = 0;
        let hasTimeItems = false;
        let hasRepsItems = false;
        
        if (routine.poses) {
            routine.poses.forEach(pose => {
                if (pose.unit === 'reps') {
                    totalReps += pose.duration;
                    hasRepsItems = true;
                } else {
                    totalTime += pose.duration;
                    hasTimeItems = true;
                }
            });
        }
        
        // Create display text with emphasized numbers
        let displayText = '';
        if (hasRepsItems && hasTimeItems) {
            // Both reps and time
            displayText = `<span class="duration-number">${totalReps}</span> Choo's + <span class="duration-number">${formatDuration(totalTime)}</span>`;
        } else if (hasRepsItems) {
            // Only reps
            displayText = `<span class="duration-number">${totalReps}</span> Choo's`;
        } else {
            // Only time (or fallback to totalDuration for backwards compatibility)
            const timeText = formatDuration(totalTime || routine.totalDuration || 0);
            // Extract number from time text (e.g., "30s" -> "30", "2m 30s" -> "2")
            const timeMatch = timeText.match(/^(\d+)/);
            if (timeMatch) {
                displayText = `<span class="duration-number">${timeMatch[1]}</span>${timeText.substring(timeMatch[1].length)}`;
            } else {
                displayText = timeText;
            }
        }
        
        const routineElement = document.createElement('div');
        routineElement.className = 'routine-item';
        routineElement.innerHTML = `
            <div class="routine-content">
                <div class="routine-name">${routine.name}</div>
                <div class="routine-duration">${displayText}</div>
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
    }, loadingDelay);
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

function renderActivities() {
    const activitiesGrid = document.getElementById('activities-grid');
    activitiesGrid.innerHTML = '';
    
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-option';
        activityElement.innerHTML = `
            <img src="${activity.image}" alt="${activity.name}">
            <div class="activity-name">${activity.name}</div>
        `;
        activityElement.addEventListener('click', () => selectActivity(activity));
        activitiesGrid.appendChild(activityElement);
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

// Selection functions
function selectPose(pose) {
    // Remove previous selection
    document.querySelectorAll('.pose-option').forEach(el => el.classList.remove('selected'));
    
    // Select new pose
    event.target.closest('.pose-option').classList.add('selected');
    
    // Keep poses grid open and show time modal
    showTimeModal(pose);
}

function selectActivity(activity) {
    // Remove previous selection
    document.querySelectorAll('.activity-option').forEach(el => el.classList.remove('selected'));
    
    // Select new activity
    event.target.closest('.activity-option').classList.add('selected');
    
    // Keep activities grid open and show time modal
    showTimeModal(activity);
}

function selectExercise(exercise) {
    // Remove previous selection
    document.querySelectorAll('.exercise-option').forEach(el => el.classList.remove('selected'));
    
    // Select new exercise
    event.target.closest('.exercise-option').classList.add('selected');
    
    // Keep exercises grid open and show time modal
    showTimeModal(exercise);
}

function selectTime(time, element) {
    // Remove previous time selection
    document.querySelectorAll('.time-option').forEach(el => el.classList.remove('selected'));
    
    // Select new time
    element.classList.add('selected');
    selectedTime = time;
    
    // Add pose to routine
    addPoseToRoutine();
}

function selectRepetition(reps, element) {
    // Remove previous repetition selection
    document.querySelectorAll('.repetition-option').forEach(el => el.classList.remove('selected'));
    
    // Select new repetition
    element.classList.add('selected');
    selectedTime = reps; // Use selectedTime for consistency
    
    // Add exercise to routine
    addPoseToRoutine();
}

// Routine management functions
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
        hideTimeModal();
        
        // Clear selections
        selectedPose = null;
        selectedExercise = null;
        selectedTime = null;
        
        // Clear visual selections
        document.querySelectorAll('.pose-option, .activity-option, .exercise-option').forEach(el => el.classList.remove('selected'));
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
                        <div class="pose-duration">${item.unit === 'reps' ? `${item.duration} Choo's` : formatDuration(item.duration)}</div>
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
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(item.dataset.index);
            
            if (fromIndex !== toIndex) {
                reorderPoses(fromIndex, toIndex);
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
    // Get fresh references to elements
    const input = document.getElementById('routine-name-input');
    const saveBtn = document.getElementById('save-routine-btn');
    
    const hasName = input && input.value.trim().length > 0;
    const hasPoses = currentRoutine.length > 0;
    const canSave = hasName && hasPoses;
    
    console.log('updateSaveButton called:');
    console.log('- Input element found:', !!input);
    console.log('- Input value:', input ? input.value : 'N/A');
    console.log('- Input value trimmed:', input ? input.value.trim() : 'N/A');
    console.log('- Has name:', hasName);
    console.log('- Has poses:', hasPoses, '(count:', currentRoutine.length, ')');
    console.log('- Can save:', canSave);
    console.log('- Save button found:', !!saveBtn);
    
    if (saveBtn) {
        saveBtn.disabled = !canSave;
        
        // Update visual state
        if (canSave) {
            saveBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            saveBtn.style.color = 'white';
            saveBtn.style.cursor = 'pointer';
            console.log('- Save button enabled: purple background applied');
        } else {
            saveBtn.style.background = '#e2e8f0';
            saveBtn.style.color = '#a0aec0';
            saveBtn.style.cursor = 'not-allowed';
            console.log('- Save button disabled: gray background applied');
        }
    } else {
        console.error('Save button element not found');
    }
}

// Save routine
function saveRoutine() {
    console.log('saveRoutine() called');
    console.log('- currentRoutineName:', currentRoutineName);
    
    // Get fresh DOM reference to input
    const inputElement = document.getElementById('routine-name-input');
    console.log('- inputElement:', inputElement);
    console.log('- inputElement.value:', inputElement ? inputElement.value : 'N/A');
    console.log('- currentRoutine.length:', currentRoutine.length);
    
    const name = currentRoutineName || (inputElement ? inputElement.value.trim() : '');
    console.log('- Final name:', name);
    console.log('- Final name length:', name.length);
    
    if (!name || currentRoutine.length === 0) {
        console.log('Save aborted - missing name or poses');
        console.log('- Has name:', !!name);
        console.log('- Has poses:', currentRoutine.length > 0);
        return;
    }
    
    const totalDuration = currentRoutine.reduce((sum, pose) => sum + pose.duration, 0);
    
    const routine = {
        id: Date.now(),
        name: name,
        poses: currentRoutine,
        totalDuration: totalDuration,
        createdAt: new Date().toISOString()
    };
    
    console.log('Saving routine:', routine);
    
    routines.push(routine);
    localStorage.setItem('kwiggaTrains', JSON.stringify(routines));
    console.log('Routine saved to localStorage');
    
    // Calculate stats before clearing currentRoutine
    const totalReps = currentRoutine.reduce((sum, item) => {
        return sum + (item.unit === 'reps' ? item.duration : 0);
    }, 0);
    
    const totalTimeSeconds = currentRoutine.reduce((sum, item) => {
        return sum + (item.unit === 'seconds' ? item.duration : 0);
    }, 0);
    
    // Clear the current routine and routine poses list
    currentRoutine = [];
    renderRoutinePoses();
    console.log('Current routine cleared and rendered');
    
    // Format time function
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };
    
    // Show save completion modal with stats
    const saveCompletionModal = document.getElementById('save-completion-modal');
    if (saveCompletionModal) {
        // Update save completion stats
        const repsElement = document.getElementById('save-completion-reps');
        const timeElement = document.getElementById('save-completion-time');
        
        if (repsElement) {
            repsElement.textContent = `${totalReps} Choo's`;
        }
        if (timeElement) {
            timeElement.textContent = formatTime(totalTimeSeconds);
        }
        
        saveCompletionModal.classList.add('active');
        console.log('Save completion modal shown with stats');
        console.log('- Total reps:', totalReps);
        console.log('- Total time:', formatTime(totalTimeSeconds));
    } else {
        console.error('Save completion modal element not found');
    }
}

// Hide save completion modal
function hideSaveCompletionModal() {
    const saveCompletionModal = document.getElementById('save-completion-modal');
    if (saveCompletionModal) {
        saveCompletionModal.classList.remove('active');
        console.log('Save completion modal hidden');
    }
    showMainScreen();
}

// Make hideSaveCompletionModal globally available
window.hideSaveCompletionModal = hideSaveCompletionModal;

// Delete and rename functions
function confirmDeleteRoutine() {
    if (routineToDelete) {
        // Remove routine from array
        routines = routines.filter(r => r.id !== routineToDelete.id);
        
        // Update localStorage
        localStorage.setItem('kwiggaTrains', JSON.stringify(routines));
        
        // Re-render routines
        renderRoutines();
        
        // Hide modal
        hideDeleteModal();
    }
}

function confirmRenameRoutine() {
    console.log('confirmRenameRoutine called');
    if (!routineToRename) {
        console.log('No routine to rename');
        return;
    }
    
    // Get the current input value (fresh reference)
    const input = document.getElementById('rename-input');
    const newName = input ? input.value.trim() : '';
    
    console.log('New name:', newName);
    console.log('Current name:', routineToRename.name);
    
    if (!newName || newName === routineToRename.name) {
        console.log('Name unchanged or empty, closing modal');
        hideRenameModal();
        return;
    }
    
    // Check if name already exists
    const nameExists = routines.some(r => r.name === newName && r.id !== routineToRename.id);
    if (nameExists) {
        alert('A train with this name already exists. Please choose a different name.');
        return;
    }
    
    // Update routine name
    routineToRename.name = newName;
    console.log('Updated routine name to:', routineToRename.name);
    
    // Update localStorage
    localStorage.setItem('kwiggaTrains', JSON.stringify(routines));
    
    // Re-render routines
    renderRoutines();
    
    // Hide modal
    hideRenameModal();
    console.log('Rename completed successfully');
}
