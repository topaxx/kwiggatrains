// History Management Functions

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
    a.download = `yoga-history-${new Date().toISOString().split('T')[0]}.json`;
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
}

function hideImportHistoryModal() {
    importHistoryModal.classList.remove('active');
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
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
    if (file.type !== 'application/json') {
        alert('Please select a JSON file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            validateImportData(data);
        } catch (error) {
            alert('Invalid JSON file. Please check the file format.');
            console.error('JSON parse error:', error);
        }
    };
    reader.readAsText(file);
}

function validateImportData(data) {
    if (!data.history || !Array.isArray(data.history)) {
        alert('Invalid history format. The file should contain a "history" array.');
        return;
    }
    
    // Validate history entries
    const validEntries = data.history.filter(entry => 
        entry.id && 
        entry.routineName && 
        entry.completedAt && 
        entry.duration !== undefined && 
        entry.poseCount !== undefined
    );
    
    if (validEntries.length === 0) {
        alert('No valid history entries found in the file.');
        return;
    }
    
    // Store valid entries for import
    window.pendingImportData = validEntries;
    updateFileInputDisplay(validEntries.length);
    confirmImportHistoryBtn.disabled = false;
}

function updateFileInputDisplay(entryCount = null) {
    if (entryCount !== null) {
        fileInputArea.innerHTML = `
            <div class="file-input-content">
                <div class="file-input-icon">✅</div>
                <div class="file-input-text">${entryCount} entries ready to import</div>
                <div class="file-input-hint">Click to select a different file</div>
            </div>
        `;
    } else {
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
    importImportSuccessModal.classList.add('active');
}

function hideImportSuccessModal() {
    importSuccessModal.classList.remove('active');
}

// History rendering functions
function renderHistory() {
    console.log('Rendering history with', completionLog.length, 'entries');
    console.log('Completion log:', completionLog);
    
    // Double-check localStorage
    const storedLog = JSON.parse(localStorage.getItem('yogaCompletionLog') || '[]');
    console.log('Stored in localStorage:', storedLog);
    
    renderHistoryStats();
    renderHistoryList();
}

function renderHistoryStats() {
    const totalCompletions = completionLog.length;
    const totalTime = completionLog.reduce((sum, entry) => sum + (entry.totalTime || entry.duration || 0), 0);
    const totalPoses = completionLog.reduce((sum, entry) => sum + entry.poseCount, 0);
    const totalReps = completionLog.reduce((sum, entry) => sum + (entry.totalReps || 0), 0);
    
    // Calculate average routines per week
    const averageRoutinesPerWeek = calculateAverageRoutinesPerWeek();
    
    // Calculate favorite routine
    const routineCounts = {};
    completionLog.forEach(entry => {
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
    if (completionLog.length === 0) return 0;
    
    // Get the date range
    const dates = completionLog.map(entry => new Date(entry.completedAt));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    // Calculate weeks between first and last completion
    const timeDiff = latestDate.getTime() - earliestDate.getTime();
    const weeksDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7)));
    
    // Calculate average routines per week
    const averagePerWeek = completionLog.length / weeksDiff;
    
    return Math.round(averagePerWeek * 10) / 10; // Round to 1 decimal place
}

function calculateLongestStreak() {
    if (completionLog.length === 0) return 0;
    
    // Get unique days with completions
    const completionDays = new Set();
    completionLog.forEach(entry => {
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
    if (completionLog.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <h3>No history yet</h3>
                <p>Complete some routines to see your progress here!</p>
            </div>
        `;
        return;
    }
    
    // Group entries by month
    const groupedEntries = {};
    completionLog.forEach(entry => {
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
