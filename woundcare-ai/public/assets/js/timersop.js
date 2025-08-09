import { getState, updateState } from './state.js';
import { showError } from './ui.js';

function startTimer(fieldId) {
    const state = getState();
    const startTime = Date.now();
    
    updateState('timerValues', {
        ...state.timerValues,
        [fieldId]: {
            startTime,
            elapsed: 0,
            active: true
        }
    });
    
    updateTimerDisplay(fieldId);
}

function stopTimer(fieldId) {
    const state = getState();
    const timer = state.timerValues[fieldId];
    
    if (!timer || !timer.active) return;
    
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    
    updateState('timerValues', {
        ...state.timerValues,
        [fieldId]: {
            ...timer,
            elapsed,
            active: false
        }
    });
    
    // Update the corresponding form field
    const inputField = document.querySelector(`[data-timer-field="${fieldId}"]`);
    if (inputField) {
        inputField.value = elapsed;
    }
}

function updateTimerDisplay(fieldId) {
    const state = getState();
    const timer = state.timerValues[fieldId];
    const displayElement = document.querySelector(`[data-timer-display="${fieldId}"]`);
    
    if (!timer || !displayElement) return;
    
    if (timer.active) {
        const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
        displayElement.textContent = formatTime(elapsed);
        requestAnimationFrame(() => updateTimerDisplay(fieldId));
    } else {
        displayElement.textContent = formatTime(timer.elapsed);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function setupTimerButtons() {
    document.addEventListener('click', (e) => {
        const startBtn = e.target.closest('[data-timer-start]');
        const stopBtn = e.target.closest('[data-timer-stop]');
        
        if (startBtn) {
            const fieldId = startBtn.dataset.timerStart;
            startTimer(fieldId);
        }
        
        if (stopBtn) {
            const fieldId = stopBtn.dataset.timerStop;
            stopTimer(fieldId);
        }
    });
}

export { setupTimerButtons, startTimer, stopTimer };
