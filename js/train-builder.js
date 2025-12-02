// Train Builder Functions

// Rendering functions
function renderTrains() {
    const loadingIndicator = document.getElementById('trains-loading');
    const trainsContainer = document.getElementById('trains-list');
    
    // Don't show spinner - keep cached info visible
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (trainsContainer) trainsContainer.style.display = 'block';
    
    if (!trainsContainer) {
        console.error('trains-list element not found');
        return;
    }
    
    trainsContainer.innerHTML = '';
    
    // Load groups from localStorage
    trainGroups = JSON.parse(localStorage.getItem('kwiggaTrainGroups') || '[]');
    
    if (trains.length === 0 && trainGroups.length === 0) {
        trainsContainer.innerHTML = '<p style="text-align: center; color: #a0aec0; font-style: italic; padding: 40px;">No trains created yet</p>';
        return;
    }
    
    // Render groups first
    trainGroups.forEach((group) => {
        const groupTrains = trains.filter(train => group.trainIds && group.trainIds.includes(train.id));
        const groupElement = document.createElement('div');
        groupElement.className = 'train-group';
        groupElement.dataset.groupId = group.id;
        
        // Group header (always visible)
        const groupHeader = document.createElement('div');
        groupHeader.className = 'train-group-header';
        groupHeader.innerHTML = `
            <div class="group-header-content">
                <span class="group-name">${group.name}</span>
            </div>
            <div class="group-actions">
                <button class="group-manage-btn" data-group-id="${group.id}" title="Manage group">
                    <i class="fas fa-cog"></i>
                </button>
                <i class="fas fa-chevron-down group-toggle-icon"></i>
            </div>
        `;
        
        // Add event listener to manage button
        const manageBtn = groupHeader.querySelector('.group-manage-btn');
        manageBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent toggle from firing
            showManageGroupModal(group.id);
        });
        
        // Group content (collapsible)
        const groupContent = document.createElement('div');
        groupContent.className = 'train-group-content';
        groupContent.style.display = 'none'; // Collapsed by default
        
        if (groupTrains.length === 0) {
            groupContent.innerHTML = '<p style="text-align: center; color: #a0aec0; font-style: italic; padding: 20px;">No trains in this group</p>';
        } else {
            groupTrains.forEach((train) => {
                const trainElement = createTrainElement(train);
                groupContent.appendChild(trainElement);
            });
        }
        
        // Toggle functionality
        groupHeader.addEventListener('click', (e) => {
            // Don't toggle if clicking on manage button
            if (e.target.closest('.group-manage-btn')) {
                return;
            }
            const isExpanded = groupContent.style.display !== 'none';
            groupContent.style.display = isExpanded ? 'none' : 'block';
            const icon = groupHeader.querySelector('.group-toggle-icon');
            icon.classList.toggle('rotated', !isExpanded);
        });
        
        groupElement.appendChild(groupHeader);
        groupElement.appendChild(groupContent);
        trainsContainer.appendChild(groupElement);
    });
    
    // Render standalone trains (not in any group)
    const trainsInGroups = new Set();
    trainGroups.forEach(group => {
        if (group.trainIds) {
            group.trainIds.forEach(id => trainsInGroups.add(id));
        }
    });
    
    const standaloneTrains = trains.filter(train => !trainsInGroups.has(train.id));
    
    standaloneTrains.forEach((train, index) => {
        const trainElement = createTrainElement(train);
        trainsContainer.appendChild(trainElement);
    });
}

// Helper function to create a train element
function createTrainElement(train) {
    // Calculate stats for the train
    let totalTime = 0;
    let totalReps = 0;
    let hasTimeItems = false;
    let hasRepsItems = false;
    
    if (train.poses) {
        train.poses.forEach(pose => {
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
        const timeText = formatDuration(totalTime || train.totalDuration || 0);
        // Extract number from time text (e.g., "30s" -> "30", "2m 30s" -> "2")
        const timeMatch = timeText.match(/^(\d+)/);
        if (timeMatch) {
            displayText = `<span class="duration-number">${timeMatch[1]}</span>${timeText.substring(timeMatch[1].length)}`;
        } else {
            displayText = timeText;
        }
    }
    
    const trainElement = document.createElement('div');
    trainElement.className = 'train-item';
    trainElement.innerHTML = `
        <div class="train-content">
            <div class="train-name">${train.name}</div>
            <div class="train-duration">${displayText}</div>
        </div>
        <div class="train-actions">
            <button class="train-rename-btn" onclick="showRenameModal(${train.id})" title="Rename train"><i class="fas fa-edit"></i></button>
            <button class="train-delete-btn" onclick="showDeleteConfirmation(${train.id})" title="Delete train"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add click listener to train element (not the action buttons)
    trainElement.addEventListener('click', (e) => {
        // Only trigger if not clicking on action buttons
        if (!e.target.closest('.train-actions')) {
            showTrainExecution(train);
        }
    });
    
    // Add click listeners to action buttons to prevent event propagation
    const renameBtn = trainElement.querySelector('.train-rename-btn');
    const deleteBtn = trainElement.querySelector('.train-delete-btn');
    
    renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    return trainElement;
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
    
    // Add pose to train
    addPoseToTrain();
}

function selectRepetition(reps, element) {
    // Remove previous repetition selection
    document.querySelectorAll('.repetition-option').forEach(el => el.classList.remove('selected'));
    
    // Select new repetition
    element.classList.add('selected');
    selectedTime = reps; // Use selectedTime for consistency
    
    // Add exercise to train
    addPoseToTrain();
}

// Train management functions
function addPoseToTrain() {
    if ((selectedPose || selectedExercise) && selectedTime) {
        const trainItem = selectedPose ? {
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
        
        currentTrain.push(trainItem);
        renderTrainPoses();
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

function renderTrainPoses() {
    if (currentTrain.length === 0) {
        trainPosesList.innerHTML = '<p class="empty-message">Add poses and exercises to your train</p>';
        return;
    }
    
    // Create grouped container if there are 2 or more items
    const hasGrouping = currentTrain.length >= 2;
    const groupClass = hasGrouping ? 'train-items-grouped' : '';
    
    const itemsHTML = currentTrain.map((item, index) => {
        if (item.type === 'exercise') {
            return `
                <div class="train-pose-item" data-index="${index}">
                    <div class="pose-info">
                        <img src="${item.image}" alt="${item.name}" class="pose-image">
                        <div class="pose-name">${item.name}</div>
                        <div class="pose-duration">${item.unit === 'reps' ? `${item.duration} Choo's` : formatDuration(item.duration)}</div>
                    </div>
                    <button class="delete-pose" onclick="removePoseFromTrain(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        } else {
            return `
                <div class="train-pose-item" data-index="${index}">
                    <div class="pose-info">
                        <img src="${item.image}" alt="${item.name}" class="pose-image">
                        <div class="pose-name">${item.name}</div>
                        <div class="pose-duration">${formatDuration(item.duration)}</div>
                    </div>
                    <button class="delete-pose" onclick="removePoseFromTrain(${index})"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }
    }).join('');
    
    // Wrap items in grouped container if there are 2+ items
    trainPosesList.innerHTML = hasGrouping 
        ? `<div class="train-items-grouped">${itemsHTML}</div>`
        : itemsHTML;
    
    makeSortable();
}

function makeSortable() {
    const poseItems = document.querySelectorAll('.train-pose-item');
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
    const pose = currentTrain.splice(fromIndex, 1)[0];
    currentTrain.splice(toIndex, 0, pose);
    renderTrainPoses();
}

function removePoseFromTrain(index) {
    currentTrain.splice(index, 1);
    renderTrainPoses();
    updateSaveButton();
}

function updateSaveButton() {
    // Get fresh references to elements
    const input = document.getElementById('train-name-input');
    const saveBtn = document.getElementById('save-train-btn');
    
    const hasName = input && input.value.trim().length > 0;
    const hasPoses = currentTrain.length > 0;
    const canSave = hasName && hasPoses;
    
    console.log('updateSaveButton called:');
    console.log('- Input element found:', !!input);
    console.log('- Input value:', input ? input.value : 'N/A');
    console.log('- Input value trimmed:', input ? input.value.trim() : 'N/A');
    console.log('- Has name:', hasName);
    console.log('- Has poses:', hasPoses, '(count:', currentTrain.length, ')');
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

// Save train
function saveTrain() {
    console.log('saveTrain() called');
    console.log('- currentTrainName:', currentTrainName);
    
    // Get fresh DOM reference to input
    const inputElement = document.getElementById('train-name-input');
    console.log('- inputElement:', inputElement);
    console.log('- inputElement.value:', inputElement ? inputElement.value : 'N/A');
    console.log('- currentTrain.length:', currentTrain.length);
    
    const name = currentTrainName || (inputElement ? inputElement.value.trim() : '');
    console.log('- Final name:', name);
    console.log('- Final name length:', name.length);
    
    if (!name || currentTrain.length === 0) {
        console.log('Save aborted - missing name or poses');
        console.log('- Has name:', !!name);
        console.log('- Has poses:', currentTrain.length > 0);
        return;
    }
    
    const totalDuration = currentTrain.reduce((sum, pose) => sum + pose.duration, 0);
    
    const train = {
        id: Date.now(),
        name: name,
        poses: currentTrain,
        totalDuration: totalDuration,
        createdAt: new Date().toISOString()
    };
    
    console.log('Saving train:', train);
    
    trains.push(train);
    localStorage.setItem('kwiggaTrains', JSON.stringify(trains));
    console.log('Train saved to localStorage');
    
    // Clear the current train and train poses list
    currentTrain = [];
    renderTrainPoses();
    console.log('Current train cleared and rendered');
    
    // Show save completion modal
    const saveCompletionModal = document.getElementById('save-completion-modal');
    if (saveCompletionModal) {
        saveCompletionModal.classList.add('active');
        console.log('Save completion modal shown');
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

// Delete error modal functions
function showDeleteErrorModal() {
    const deleteErrorModal = document.getElementById('delete-error-modal');
    if (deleteErrorModal) {
        deleteErrorModal.classList.add('active');
    }
}

function hideDeleteErrorModal() {
    const deleteErrorModal = document.getElementById('delete-error-modal');
    if (deleteErrorModal) {
        deleteErrorModal.classList.remove('active');
    }
}

// Make delete error modal functions globally available
window.showDeleteErrorModal = showDeleteErrorModal;
window.hideDeleteErrorModal = hideDeleteErrorModal;

// Delete and rename functions
function confirmDeleteTrain() {
    if (trainToDelete) {
        try {
            // Remove train from array
            trains = trains.filter(r => r.id !== trainToDelete.id);
            
            // Update localStorage
            localStorage.setItem('kwiggaTrains', JSON.stringify(trains));
            
            // Re-render trains
            renderTrains();
            
            // Hide modal
            hideDeleteModal();
        } catch (error) {
            console.error('Error deleting train:', error);
            // Show error popup
            showDeleteErrorModal();
        }
    }
}

function confirmRenameTrain() {
    console.log('confirmRenameTrain called');
    if (!trainToRename) {
        console.log('No train to rename');
        return;
    }
    
    // Get the current input value (fresh reference)
    const input = document.getElementById('rename-input');
    const newName = input ? input.value.trim() : '';
    
    console.log('New name:', newName);
    console.log('Current name:', trainToRename.name);
    
    if (!newName || newName === trainToRename.name) {
        console.log('Name unchanged or empty, closing modal');
        hideRenameModal();
        return;
    }
    
    // Check if name already exists
    const nameExists = trains.some(r => r.name === newName && r.id !== trainToRename.id);
    if (nameExists) {
        alert('A train with this name already exists. Please choose a different name.');
        return;
    }
    
    // Update train name
    trainToRename.name = newName;
    console.log('Updated train name to:', trainToRename.name);
    
    // Update localStorage
    localStorage.setItem('kwiggaTrains', JSON.stringify(trains));
    
    // Re-render trains
    renderTrains();
    
    // Hide modal
    hideRenameModal();
    console.log('Rename completed successfully');
}

// Group management functions
function showCreateGroupModal() {
    if (groupNameInput) {
        groupNameInput.value = '';
        confirmCreateGroupBtn.disabled = true;
    }
    if (createGroupModal) {
        createGroupModal.classList.add('active');
    }
}

function hideCreateGroupModal() {
    if (createGroupModal) {
        createGroupModal.classList.remove('active');
    }
}

function createGroup() {
    const groupName = groupNameInput ? groupNameInput.value.trim() : '';
    
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    // Check if name already exists
    const nameExists = trainGroups.some(g => g.name === groupName);
    if (nameExists) {
        alert('A group with this name already exists. Please choose a different name.');
        return;
    }
    
    // Create new group
    const newGroup = {
        id: Date.now(),
        name: groupName,
        trainIds: []
    };
    
    trainGroups.push(newGroup);
    localStorage.setItem('kwiggaTrainGroups', JSON.stringify(trainGroups));
    
    // Re-render trains
    renderTrains();
    
    // Hide modal
    hideCreateGroupModal();
    console.log('Group created successfully:', newGroup);
}

let currentManageGroupId = null;

function showManageGroupModal(groupId) {
    currentManageGroupId = groupId;
    const group = trainGroups.find(g => g.id === groupId);
    
    if (!group) {
        console.error('Group not found:', groupId);
        return;
    }
    
    // Set group name
    if (manageGroupNameInput) {
        manageGroupNameInput.value = group.name;
    }
    
    // Load trains in group
    renderGroupTrainsList(group);
    
    // Load available trains for dropdown
    loadTrainsForGroupDropdown(group);
    
    // Show modal
    if (manageGroupModal) {
        manageGroupModal.classList.add('active');
    }
}

function hideManageGroupModal() {
    currentManageGroupId = null;
    if (manageGroupModal) {
        manageGroupModal.classList.remove('active');
    }
}

function renderGroupTrainsList(group) {
    if (!groupTrainsList) return;
    
    groupTrainsList.innerHTML = '';
    
    if (!group.trainIds || group.trainIds.length === 0) {
        groupTrainsList.innerHTML = '<p style="text-align: center; color: #a0aec0; font-style: italic; padding: 10px;">No trains in this group</p>';
        return;
    }
    
    group.trainIds.forEach(trainId => {
        const train = trains.find(t => t.id === trainId);
        if (train) {
            const trainItem = document.createElement('div');
            trainItem.className = 'group-train-item';
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-train-from-group-btn';
            removeBtn.title = 'Remove from group';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeTrainFromGroup(group.id, trainId);
            });
            
            const trainName = document.createElement('span');
            trainName.className = 'group-train-name';
            trainName.textContent = train.name;
            
            trainItem.appendChild(trainName);
            trainItem.appendChild(removeBtn);
            groupTrainsList.appendChild(trainItem);
        }
    });
}

function loadTrainsForGroupDropdown(group) {
    if (!addTrainToGroupDropdown) return;
    
    addTrainToGroupDropdown.innerHTML = '<option value="">-- Select a train to add --</option>';
    
    // Get trains not already in this group
    const trainsNotInGroup = trains.filter(train => 
        !group.trainIds || !group.trainIds.includes(train.id)
    );
    
    if (trainsNotInGroup.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No trains available';
        option.disabled = true;
        addTrainToGroupDropdown.appendChild(option);
        return;
    }
    
    trainsNotInGroup.forEach(train => {
        const option = document.createElement('option');
        option.value = train.id;
        option.textContent = train.name;
        addTrainToGroupDropdown.appendChild(option);
    });
}

function addTrainToGroup() {
    if (!currentManageGroupId) return;
    
    const trainId = addTrainToGroupDropdown ? Number(addTrainToGroupDropdown.value) : null;
    
    if (!trainId) {
        alert('Please select a train to add');
        return;
    }
    
    const group = trainGroups.find(g => g.id === currentManageGroupId);
    if (!group) return;
    
    if (!group.trainIds) {
        group.trainIds = [];
    }
    
    if (group.trainIds.includes(trainId)) {
        alert('This train is already in the group');
        return;
    }
    
    group.trainIds.push(trainId);
    localStorage.setItem('kwiggaTrainGroups', JSON.stringify(trainGroups));
    
    // Refresh the lists
    renderGroupTrainsList(group);
    loadTrainsForGroupDropdown(group);
    
    // Re-render trains
    renderTrains();
}

function removeTrainFromGroup(groupId, trainId) {
    const group = trainGroups.find(g => g.id === groupId);
    if (!group) return;
    
    if (group.trainIds) {
        group.trainIds = group.trainIds.filter(id => id !== trainId);
        localStorage.setItem('kwiggaTrainGroups', JSON.stringify(trainGroups));
        
        // Refresh the lists
        renderGroupTrainsList(group);
        loadTrainsForGroupDropdown(group);
        
        // Re-render trains
        renderTrains();
    }
}

function saveManageGroup() {
    if (!currentManageGroupId) return;
    
    const groupName = manageGroupNameInput ? manageGroupNameInput.value.trim() : '';
    
    if (!groupName) {
        alert('Please enter a group name');
        return;
    }
    
    const group = trainGroups.find(g => g.id === currentManageGroupId);
    if (!group) return;
    
    // Check if name already exists (excluding current group)
    const nameExists = trainGroups.some(g => g.name === groupName && g.id !== currentManageGroupId);
    if (nameExists) {
        alert('A group with this name already exists. Please choose a different name.');
        return;
    }
    
    // Update group name
    group.name = groupName;
    localStorage.setItem('kwiggaTrainGroups', JSON.stringify(trainGroups));
    
    // Re-render trains
    renderTrains();
    
    // Hide modal
    hideManageGroupModal();
}

function showDeleteGroupConfirmation() {
    if (!currentManageGroupId) return;
    
    const deleteGroupModal = document.getElementById('delete-group-confirmation-modal');
    if (deleteGroupModal) {
        deleteGroupModal.classList.add('active');
    }
}

function hideDeleteGroupConfirmation() {
    const deleteGroupModal = document.getElementById('delete-group-confirmation-modal');
    if (deleteGroupModal) {
        deleteGroupModal.classList.remove('active');
    }
}

function deleteGroup() {
    if (!currentManageGroupId) return;
    
    trainGroups = trainGroups.filter(g => g.id !== currentManageGroupId);
    localStorage.setItem('kwiggaTrainGroups', JSON.stringify(trainGroups));
    
    // Re-render trains
    renderTrains();
    
    // Hide modals
    hideDeleteGroupConfirmation();
    hideManageGroupModal();
}

// Make group functions globally available
window.showCreateGroupModal = showCreateGroupModal;
window.hideCreateGroupModal = hideCreateGroupModal;
window.createGroup = createGroup;
window.showManageGroupModal = showManageGroupModal;
window.hideManageGroupModal = hideManageGroupModal;
window.addTrainToGroup = addTrainToGroup;
window.removeTrainFromGroup = removeTrainFromGroup;
window.saveManageGroup = saveManageGroup;
window.showDeleteGroupConfirmation = showDeleteGroupConfirmation;
window.hideDeleteGroupConfirmation = hideDeleteGroupConfirmation;
window.deleteGroup = deleteGroup;
