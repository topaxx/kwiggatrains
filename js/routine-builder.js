// Routine Builder Functions

// Rendering functions
function renderRoutines() {
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
        
        // Create display text
        let displayText = '';
        if (hasRepsItems && hasTimeItems) {
            // Both reps and time
            displayText = `${totalReps} reps + ${formatDuration(totalTime)}`;
        } else if (hasRepsItems) {
            // Only reps
            displayText = `${totalReps} reps`;
        } else {
            // Only time (or fallback to totalDuration for backwards compatibility)
            displayText = formatDuration(totalTime || routine.totalDuration || 0);
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
    localStorage.setItem('kwiggaTrains', JSON.stringify(routines));
    
    // Show completion modal
    showCompletionModal();
    
    // Return to main screen
    setTimeout(() => {
        showMainScreen();
    }, 2000);
}

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
    localStorage.setItem('kwiggaTrains', JSON.stringify(routines));
    
    // Re-render routines
    renderRoutines();
    
    // Hide modal
    hideRenameModal();
}
