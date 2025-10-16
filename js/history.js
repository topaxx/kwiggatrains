// History Management Functions

// History data source state
let currentHistorySource = 'database'; // 'local' or 'database' - default to cloud
let databaseHistory = []; // Store fetched database history
let isFetchingDatabase = false; // Prevent multiple simultaneous fetches

// History screen management
function showHistoryScreen() {
    hideAllScreens();
    historyScreen.classList.add('active');
    // Stop routine execution and all sounds when viewing history
    stopRoutineExecution();
    // Refresh completion log from localStorage before rendering
    completionLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    
    // Restore the last selected history source, default to cloud if none set
    if (!currentHistorySource) {
        currentHistorySource = 'database'; // Default to cloud
    }
    
    // Setup toggle button listeners when history screen is shown
    setupHistoryToggleListeners();
    
    // Also setup event delegation as backup
    setupEventDelegation();
    
    // Update button states based on current source
    if (currentHistorySource === 'database') {
        if (toggleDatabaseBtn) toggleDatabaseBtn.classList.add('active');
        if (toggleLocalBtn) toggleLocalBtn.classList.remove('active');
    } else {
        if (toggleLocalBtn) toggleLocalBtn.classList.add('active');
        if (toggleDatabaseBtn) toggleDatabaseBtn.classList.remove('active');
    }
    
    // Load data based on current source
    if (currentHistorySource === 'database') {
        // Show loading indicator for initial cloud data load
        const loadingIndicator = document.getElementById('history-loading');
        const statsSection = document.getElementById('history-stats');
        const listSection = document.getElementById('history-list');
        
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (statsSection) statsSection.style.display = 'none';
        if (listSection) listSection.style.display = 'none';
        
        fetchDatabaseHistory().then(() => {
            // Hide loading, show content
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (statsSection) statsSection.style.display = 'block';
            if (listSection) listSection.style.display = 'block';
            renderHistory();
        }).catch((error) => {
            console.error('Error loading cloud data:', error);
            // Hide loading even on error
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (statsSection) statsSection.style.display = 'block';
            if (listSection) listSection.style.display = 'block';
            renderHistory(); // Still render with empty data
        });
    } else {
        renderHistory();
    }
}

// Make showHistoryScreen globally available
window.showHistoryScreen = showHistoryScreen;

function setupEventDelegation() {
    // Check for toggle elements with different selectors
    const toggleContainer = historyScreen.querySelector('.history-source-toggle');
    
    if (toggleContainer) {
        // Add direct event listener to toggle container
        toggleContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (button) {
                const dataSource = button.getAttribute('data-source');
                
                if (dataSource) {
                    // Update button states immediately for visual feedback
                    if (dataSource === 'local') {
                        document.getElementById('toggle-local')?.classList.add('active');
                        document.getElementById('toggle-database')?.classList.remove('active');
                    } else if (dataSource === 'database') {
                        document.getElementById('toggle-local')?.classList.remove('active');
                        document.getElementById('toggle-database')?.classList.add('active');
                    }
                    
                    switchHistorySource(dataSource);
                }
            }
        });
    }
    
    // Remove existing delegation listener if any
    historyScreen.removeEventListener('click', handleHistoryScreenClick);
    
    // Add event delegation listener
    historyScreen.addEventListener('click', handleHistoryScreenClick);
}

function handleHistoryScreenClick(event) {
    // Check if clicked on toggle button or its children
    const clickedElement = event.target;
    
    // Check if the clicked element or its parent has the toggle button ID
    let toggleButton = null;
    if (clickedElement.id === 'toggle-local' || clickedElement.closest('#toggle-local')) {
        toggleButton = 'local';
    } else if (clickedElement.id === 'toggle-database' || clickedElement.closest('#toggle-database')) {
        toggleButton = 'database';
    } else {
        // Check if clicked on a button with source-toggle-btn class
        if (clickedElement.classList.contains('source-toggle-btn')) {
            const dataSource = clickedElement.getAttribute('data-source');
            if (dataSource === 'local') {
                toggleButton = 'local';
            } else if (dataSource === 'database') {
                toggleButton = 'database';
            }
        }
        // Check if clicked on child of toggle button
        else if (clickedElement.closest('.source-toggle-btn')) {
            const parentButton = clickedElement.closest('.source-toggle-btn');
            const dataSource = parentButton.getAttribute('data-source');
            if (dataSource === 'local') {
                toggleButton = 'local';
            } else if (dataSource === 'database') {
                toggleButton = 'database';
            }
        }
    }
    
    if (toggleButton) {
        event.preventDefault();
        event.stopPropagation();
        switchHistorySource(toggleButton);
    }
}

function setupHistoryToggleListeners() {
    // Wait a bit for the DOM to update after showing the screen
    setTimeout(() => {
        const localBtn = document.getElementById('toggle-local');
        const databaseBtn = document.getElementById('toggle-database');
        
        // Remove existing listeners first
        if (localBtn) {
            localBtn.replaceWith(localBtn.cloneNode(true));
        }
        if (databaseBtn) {
            databaseBtn.replaceWith(databaseBtn.cloneNode(true));
        }
        
        // Get fresh references after replacing
        const newLocalBtn = document.getElementById('toggle-local');
        const newDatabaseBtn = document.getElementById('toggle-database');
        
        if (newLocalBtn) {
            newLocalBtn.addEventListener('click', () => {
                switchHistorySource('local');
            });
        }
        
        if (newDatabaseBtn) {
            newDatabaseBtn.addEventListener('click', () => {
                switchHistorySource('database');
            });
        }
    }, 50); // Small delay to ensure DOM is updated
}

// Basic history functions
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
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `kwiggaTrains-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import history functions
function showImportHistoryModal() {
    importHistoryModal.classList.add('active');
    // Reset file input
    importFileInput.value = '';
    confirmImportHistoryBtn.disabled = true;
    updateFileInputDisplay();
    
    // Add a direct click listener to the file input area when modal is shown
    console.log('Adding direct click listener to file input area');
    const fileArea = document.getElementById('file-input-area');
    if (fileArea) {
        // Remove any existing listeners first
        fileArea.removeEventListener('click', handleFileAreaClick);
        // Add the click listener
        fileArea.addEventListener('click', handleFileAreaClick);
        console.log('Direct click listener added to file input area');
    }
}

function handleFileAreaClick(event) {
    console.log('Direct file area click handler triggered!', event);
    event.preventDefault();
    event.stopPropagation();
    
    // Create a new file input element dynamically
    console.log('Creating new file input element...');
    const newFileInput = document.createElement('input');
    newFileInput.type = 'file';
    newFileInput.accept = '.json';
    newFileInput.style.display = 'none';
    
    // Add change event listener to the new input
    newFileInput.addEventListener('change', (event) => {
        console.log('New file input change event:', event);
        handleFileSelect(event);
        // Clean up the temporary input
        document.body.removeChild(newFileInput);
    });
    
    // Add to DOM and trigger click
    document.body.appendChild(newFileInput);
    console.log('New file input created and added to DOM');
    
    try {
        newFileInput.click();
        console.log('New file input click triggered');
    } catch (error) {
        console.error('Error triggering new file input click:', error);
        // Clean up on error
        if (document.body.contains(newFileInput)) {
            document.body.removeChild(newFileInput);
        }
    }
}

function hideImportHistoryModal() {
    importHistoryModal.classList.remove('active');
}

function handleFileSelect(event) {
    console.log('handleFileSelect called with event:', event);
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file) {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
        processFile(file);
    } else {
        console.log('No file selected');
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
    console.log('processFile called with:', file.name, file.type);
    if (file.type !== 'application/json') {
        console.log('Invalid file type:', file.type);
        showImportErrorModal('Please select a JSON file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('File read successfully, parsing JSON...');
        try {
            const data = JSON.parse(e.target.result);
            console.log('JSON parsed successfully:', data);
            validateImportData(data);
        } catch (error) {
            console.error('JSON parse error:', error);
            showImportErrorModal('Invalid JSON file. Please check the file format.');
        }
    };
    reader.onerror = function(error) {
        console.error('File read error:', error);
        showImportErrorModal('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

function validateImportData(data) {
    console.log('validateImportData called with:', data);
    if (!data.history || !Array.isArray(data.history)) {
        console.log('Invalid data structure - missing history array');
        showImportErrorModal('Invalid history format. The file should contain a "history" array.');
        return;
    }
    
    console.log('History array found with', data.history.length, 'entries');
    
    // Validate history entries - check for both totalTime and duration
    const validEntries = data.history.filter(entry => {
        const hasRequiredFields = entry.id && 
                                 entry.routineName && 
                                 entry.completedAt && 
                                 (entry.totalTime !== undefined || entry.duration !== undefined) && 
                                 entry.poseCount !== undefined;
        
        if (!hasRequiredFields) {
            console.log('Invalid entry:', entry);
        }
        
        return hasRequiredFields;
    });
    
    console.log('Valid entries found:', validEntries.length, 'out of', data.history.length);
    
    if (validEntries.length === 0) {
        console.log('No valid entries found');
        showImportErrorModal('No valid history entries found in the file.');
        return;
    }
    
    // Normalize the data to ensure both totalTime and duration exist
    const normalizedEntries = validEntries.map(entry => ({
        ...entry,
        totalTime: entry.totalTime || entry.duration || 0,
        duration: entry.totalTime || entry.duration || 0
    }));
    
    console.log('Normalized entries:', normalizedEntries.length);
    
    // Store valid entries for import
    window.pendingImportData = normalizedEntries;
    updateFileInputDisplay(normalizedEntries.length);
    confirmImportHistoryBtn.disabled = false;
}

function updateFileInputDisplay(entryCount = null) {
    console.log('updateFileInputDisplay called with entryCount:', entryCount);
    if (entryCount !== null) {
        console.log('Updating display to show', entryCount, 'entries ready to import');
        fileInputArea.innerHTML = `
            <div class="file-input-content">
                <div class="file-input-icon">✅</div>
                <div class="file-input-text">${entryCount} entries ready to import</div>
                <div class="file-input-hint">Click to select a different file</div>
            </div>
        `;
    } else {
        console.log('Resetting display to default state');
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
    completionLog.push(...newEntries);
    
    // Save to localStorage
    localStorage.setItem('yogaCompletionLog', JSON.stringify(completionLog));
    
    // Show success message
    const message = `Successfully imported ${newEntries.length} new entries.`;
    showImportSuccessModal(message);
    
    // Re-render history
    renderHistory();
    
    // Clear pending data
    window.pendingImportData = null;
    
    // Hide import modal after a delay
    setTimeout(() => {
        hideImportHistoryModal();
    }, 2000);
}

function showImportSuccessModal(message) {
    importSuccessText.textContent = message;
    importSuccessModal.classList.add('active');
}

function hideImportSuccessModal() {
    importSuccessModal.classList.remove('active');
}

// Data source toggle functions
async function switchHistorySource(source) {
    currentHistorySource = source;
    
    // Update button states - Get fresh references to ensure we have the right elements
    const localBtn = document.getElementById('toggle-local');
    const databaseBtn = document.getElementById('toggle-database');
    const loadingIndicator = document.getElementById('history-loading');
    const statsSection = historyStats;
    const listSection = historyList;
    
    
    // Update button visual states
    if (source === 'local') {
        if (localBtn) localBtn.classList.add('active');
        if (databaseBtn) databaseBtn.classList.remove('active');
        
        // Hide loading, show content
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (statsSection) statsSection.style.display = 'block';
        if (listSection) listSection.style.display = 'block';
        
        // Re-render history with local source
        renderHistory();
    } else {
        if (localBtn) localBtn.classList.remove('active');
        if (databaseBtn) databaseBtn.classList.add('active');
        
        // Show loading indicator
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (statsSection) statsSection.style.display = 'none';
        if (listSection) listSection.style.display = 'none';
        
        // Fetch database history if switching to database
        await fetchDatabaseHistory();
        
        // Hide loading, show content
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (statsSection) statsSection.style.display = 'block';
        if (listSection) listSection.style.display = 'block';
        
        // Re-render history with database source
        renderHistory();
    }
    
}

async function fetchDatabaseHistory() {
    // Prevent multiple simultaneous fetches
    if (isFetchingDatabase) {
        console.log('⏳ Database fetch already in progress, skipping...');
        return;
    }
    
    isFetchingDatabase = true;
    console.log('🌐 Fetching cloud data for user:', currentUser?.sub);
    
    // Check if user is logged in
    if (typeof currentUser === 'undefined' || !currentUser) {
        console.warn('⚠️ User not logged in, cannot fetch database history');
        databaseHistory = [];
        isFetchingDatabase = false;
        return;
    }
    
    if (typeof getUserTrainings === 'function') {
        try {
            const trainings = await getUserTrainings();
            console.log('📊 Cloud data received:', trainings?.length || 0, 'records');
            
            // Transform database format to match localStorage format
            databaseHistory = trainings.map(training => ({
                id: training.id,
                routineName: training.routine_name,
                completedAt: training.completed_at,
                duration: training.duration || 0,
                totalTime: training.duration || 0,
                totalReps: training.total_reps || 0,
                poseCount: training.pose_count || 0,
                hasTimeItems: training.has_time_items || false,
                hasRepsItems: training.has_reps_items || false
            }));
            
            console.log('✅ Cloud data processed:', databaseHistory.length, 'entries');
        } catch (error) {
            console.error('❌ Error fetching cloud data:', error);
            databaseHistory = [];
        }
    } else {
        console.warn('⚠️ getUserTrainings function not available');
        databaseHistory = [];
    }
    
    isFetchingDatabase = false;
}

function getCurrentHistoryData() {
    return currentHistorySource === 'local' ? completionLog : databaseHistory;
}

// History rendering functions
function renderHistory() {
    const historyData = getCurrentHistoryData();
    renderHistoryStats();
    renderHistoryList();
}

function renderHistoryStats() {
    const historyData = getCurrentHistoryData();
    
    const totalCompletions = historyData.length;
    const totalTime = historyData.reduce((sum, entry) => sum + (entry.totalTime || entry.duration || 0), 0);
    const totalPoses = historyData.reduce((sum, entry) => sum + entry.poseCount, 0);
    const totalReps = historyData.reduce((sum, entry) => sum + (entry.totalReps || 0), 0);
    
    // Calculate average routines per week
    const averageRoutinesPerWeek = calculateAverageRoutinesPerWeek();
    
    // Calculate favorite routine
    const routineCounts = {};
    historyData.forEach(entry => {
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
                <div class="stat-number">${formatDuration(totalTime)}</div>
                <div class="stat-label">Total Time</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalReps}</div>
                <div class="stat-label">Total Reps</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${averageRoutinesPerWeek}</div>
                <div class="stat-label">Avg/Week</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${longestStreak}</div>
                <div class="stat-label">Longest Daily Streak</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${favoriteRoutine}</div>
                <div class="stat-label">Favorite Routine</div>
            </div>
        </div>
    `;
}

function calculateAverageRoutinesPerWeek() {
    const historyData = getCurrentHistoryData();
    
    if (historyData.length === 0) return 0;
    
    // Get the date range
    const dates = historyData.map(entry => new Date(entry.completedAt));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    // Calculate weeks between first and last completion
    const timeDiff = latestDate.getTime() - earliestDate.getTime();
    const weeksDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)));
    
    // Calculate average routines per week
    const averagePerWeek = historyData.length / weeksDiff;
    
    return Math.round(averagePerWeek * 10) / 10; // Round to 1 decimal place
}

function calculateLongestStreak() {
    const historyData = getCurrentHistoryData();
    
    if (historyData.length === 0) return 0;
    
    // Get unique days with completions
    const completionDays = new Set();
    historyData.forEach(entry => {
        const date = new Date(entry.completedAt);
        const dayString = date.toDateString(); // Gets "Mon Jan 01 2024" format
        completionDays.add(dayString);
    });
    
    // Convert to sorted array of dates
    const sortedDays = Array.from(completionDays)
        .map(dayString => new Date(dayString))
        .sort((a, b) => a - b);
    
    let longestStreak = 0;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
        const prevDay = sortedDays[i - 1];
        const currentDay = sortedDays[i];
        
        // Check if days are consecutive
        const timeDiff = currentDay.getTime() - prevDay.getTime();
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }
    
    return Math.max(longestStreak, currentStreak);
}

function renderHistoryList() {
    const historyData = getCurrentHistoryData();
    
    // Show/hide action buttons based on data source
    const exportBtn = document.getElementById('export-history-btn');
    const importBtn = document.getElementById('import-history-btn');
    const clearBtn = document.getElementById('clear-history-btn');
    
    if (currentHistorySource === 'database') {
        // Hide buttons for cloud data
        if (exportBtn) exportBtn.style.display = 'none';
        if (importBtn) importBtn.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
    } else {
        // Show buttons for local data
        if (exportBtn) exportBtn.style.display = 'block';
        if (importBtn) importBtn.style.display = 'block';
        if (clearBtn) clearBtn.style.display = 'block';
    }
    
    if (historyData.length === 0) {
        let emptyMessage;
        
        if (currentHistorySource === 'database') {
            // Check if user is logged in
            const isLoggedIn = typeof currentUser !== 'undefined' && currentUser;
            emptyMessage = isLoggedIn 
                ? 'No cloud history found. Complete routines to save your progress to the cloud!'
                : 'Log in to view your cloud history. Go to Settings to log in.';
        } else {
            emptyMessage = 'No local history yet. Complete routines to see your progress here!';
        }
        
        historyList.innerHTML = `
            <div class="empty-history">
                <h3>No History</h3>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }
    
    // Group entries by month
    const groupedEntries = {};
    historyData.forEach(entry => {
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
        
        // Sort entries within this month by date (newest first)
        groupedEntries[month].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        groupedEntries[month].forEach(entry => {
            const date = new Date(entry.completedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create display text for reps and time
            let displayText = '';
            const hasReps = entry.totalReps && entry.totalReps > 0;
            const hasTime = entry.totalTime && entry.totalTime > 0;
            
            if (hasReps && hasTime) {
                // Both reps and time
                displayText = `${entry.totalReps} reps + ${formatDuration(entry.totalTime)}`;
            } else if (hasReps) {
                // Only reps
                displayText = `${entry.totalReps} reps`;
            } else {
                // Only time (fallback to duration for backwards compatibility)
                displayText = formatDuration(entry.totalTime || entry.duration || 0);
            }
            
            html += `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-routine-name">${entry.routineName}</div>
                        <div class="history-date">${formattedDate}</div>
                    </div>
                    <div class="history-details">
                        <div class="history-detail-item">
                            <span>Duration:</span>
                            <span>${displayText}</span>
                        </div>
                        ${entry.poseCount > 0 ? `
                        <div class="history-detail-item">
                            <span>Poses:</span>
                            <span>${entry.poseCount}</span>
                        </div>
                        ` : ''}
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
