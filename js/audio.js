// Audio Management Functions

// Initialize bell sound
function initBellSound() {
    bellSound = new Audio('sounds/bellsound.mp3');
    bellSound.preload = 'auto';
    bellSound.volume = 0.7; // Set volume to 70%
}

// Initialize bowl sound
function initBowlSound() {
    bowlSound = new Audio('sounds/bowlsound.mp3');
    bowlSound.preload = 'auto';
    bowlSound.volume = 1; // Set volume to 100%
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

// Bowl sound function
function playBowlSound() {
    if (bowlSound) {
        bowlSound.currentTime = 0; // Reset to beginning
        bowlSound.play().catch(error => {
            console.log('Could not play bowl sound:', error);
        });
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
