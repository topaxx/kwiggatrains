// Audio Management Functions

// Initialize bell sound based on user preference
function initBellSound() {
    const soundFile = getBellSoundFile(selectedBellSound);
    if (soundFile) {
        bellSound = new Audio(soundFile);
        bellSound.preload = 'auto';
        bellSound.volume = 0.7; // Set volume to 70%
    }
}

// Get bell sound file path based on selection
function getBellSoundFile(soundName) {
    switch(soundName) {
        case 'bellsound':
            return 'sounds/bellsound.mp3';
        case 'bellsound2':
            return 'sounds/bellsound2.wav';
        case 'bellsound3':
            return 'sounds/bellsound3.wav';
        default:
            return 'sounds/bellsound.mp3';
    }
}

// Update bell sound when user changes selection
function updateBellSound(soundName) {
    selectedBellSound = soundName;
    localStorage.setItem('bellSound', soundName);
    
    // Reinitialize the sound
    if (bellSound) {
        bellSound.pause();
        bellSound = null;
    }
    initBellSound();
}

// Initialize bowl sound
function initBowlSound() {
    bowlSound = new Audio('sounds/bowlsound.mp3');
    bowlSound.preload = 'auto';
    bowlSound.volume = 1; // Set volume to 100%
}

// Initialize completion sound based on user preference
function initCompletionSound() {
    const soundFile = getCompletionSoundFile(selectedCompletionSound);
    if (soundFile) {
        completionSound = new Audio(soundFile);
        completionSound.preload = 'auto';
        completionSound.volume = 1; // Set volume to 100%
    }
}

// Get completion sound file path based on selection
function getCompletionSoundFile(soundName) {
    switch(soundName) {
        case 'bowlsound':
            return 'sounds/bowlsound.mp3';
        case 'bowlsound2':
            return 'sounds/bowlsound2.wav';
        case 'bowlsound3':
            return 'sounds/bowlsound3.wav';
        default:
            return 'sounds/bowlsound.mp3';
    }
}

// Update completion sound when user changes selection
function updateCompletionSound(soundName) {
    selectedCompletionSound = soundName;
    localStorage.setItem('completionSound', soundName);
    
    // Reinitialize the sound
    if (completionSound) {
        completionSound.pause();
        completionSound = null;
    }
    initCompletionSound();
}

// Bell sound function
function playBellSound() {
    if (bellSound) {
        bellSound.currentTime = 0; // Reset to beginning
        bellSound.play().catch(error => {
            console.log('Could not play bell sound:', error);
        });
    }
}

// Bowl sound function (kept for backwards compatibility)
function playBowlSound() {
    if (bowlSound) {
        bowlSound.currentTime = 0; // Reset to beginning
        bowlSound.play().catch(error => {
            console.log('Could not play bowl sound:', error);
        });
    }
}

// Play completion sound (uses selected sound)
function playCompletionSound() {
    if (completionSound) {
        completionSound.currentTime = 0; // Reset to beginning
        completionSound.play().catch(error => {
            console.log('Could not play completion sound:', error);
            // Fallback to bowl sound if selected sound fails
            if (bowlSound) {
                bowlSound.currentTime = 0;
                bowlSound.play().catch(err => {
                    console.log('Could not play fallback bowl sound:', err);
                });
            }
        });
    } else {
        // Fallback to bowl sound if completion sound not initialized
        playBowlSound();
    }
}

// Stop all sounds function with fade out animation
function stopAllSounds() {
    const fadeOutDuration = 1000; // 1 seconds
    const fadeOutSteps = 10; // Number of steps for smooth fade
    const stepDuration = fadeOutDuration / fadeOutSteps;
    
    // Fade out bell sound
    if (bellSound && !bellSound.paused) {
        fadeOutSound(bellSound, fadeOutSteps, stepDuration);
    }
    
    // Fade out bowl sound
    if (bowlSound && !bowlSound.paused) {
        fadeOutSound(bowlSound, fadeOutSteps, stepDuration);
    }
    
    // Fade out completion sound
    if (completionSound && !completionSound.paused) {
        fadeOutSound(completionSound, fadeOutSteps, stepDuration);
    }
}

// Stop train execution completely
function stopTrainExecution() {
    // Clear timer
    clearTimeout(timer);
    timer = null;
    
    // Stop all sounds
    stopAllSounds();
    
    // Reset execution state
    isPaused = false;
    currentTimeLeft = 0;
    
    // Note: Don't call showMainScreen() here to avoid circular dependency
    // The calling function should handle screen navigation
}

// Fade out individual sound
function fadeOutSound(audio, steps, stepDuration) {
    const initialVolume = audio.volume;
    const volumeStep = initialVolume / steps;
    let currentStep = 0;
    
    const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, initialVolume - (volumeStep * currentStep));
        audio.volume = newVolume;
        
        if (currentStep >= steps || newVolume <= 0) {
            clearInterval(fadeInterval);
            audio.pause();
            audio.currentTime = 0;
            // Reset volume to original level for next use
            audio.volume = initialVolume;
        }
    }, stepDuration);
}

// Preview functions - play sound without changing selection
function previewBellSound(soundName) {
    const soundFile = getBellSoundFile(soundName);
    if (soundFile) {
        const previewSound = new Audio(soundFile);
        previewSound.volume = 0.7; // Same volume as bell sound
        previewSound.play().catch(error => {
            console.log('Could not play preview bell sound:', error);
        });
    }
}

function previewCompletionSound(soundName) {
    const soundFile = getCompletionSoundFile(soundName);
    if (soundFile) {
        const previewSound = new Audio(soundFile);
        previewSound.volume = 1; // Same volume as completion sound
        previewSound.play().catch(error => {
            console.log('Could not play preview completion sound:', error);
        });
    }
}

// Make completion sound functions globally available
window.initCompletionSound = initCompletionSound;
window.updateCompletionSound = updateCompletionSound;
window.playCompletionSound = playCompletionSound;

// Make bell sound functions globally available
window.playBellSound = playBellSound;
window.updateBellSound = updateBellSound;

// Make preview functions globally available
window.previewBellSound = previewBellSound;
window.previewCompletionSound = previewCompletionSound;
