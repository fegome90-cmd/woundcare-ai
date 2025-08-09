export function showError(message, duration = 5000) {
    const errorContainer = document.getElementById('form-errors');
    const errorMessage = document.getElementById('form-errors-msg');
    
    if (!errorContainer || !errorMessage) {
        console.error('Error:', message);
        return;
    }
    
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    
    setTimeout(() => {
        errorContainer.classList.add('active');
    }, 10);

    setTimeout(() => {
        errorContainer.classList.remove('active');
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 300);
    }, duration);
}

export function handleFetchError(error) {
    if (error.name === 'AbortError') {
        return 'Request timed out';
    }
    
    if (!navigator.onLine) {
        return 'No internet connection';
    }
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Failed to connect to server';
    }
    
    return error.message || 'An unexpected error occurred';
}

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Promise that rejects after ms
export function withTimeout(promise, ms = 8000, label = 'Operation') {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), ms);
    const timed = (async () => {
        try {
            return await promise(controller.signal);
        } finally {
            clearTimeout(t);
        }
    })();
    timed.catch(() => {});
    timed.abortController = controller;
    return timed;
}

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export function on(el, type, handler, opts) {
    if (!el) return () => {};
    el.addEventListener(type, handler, opts);
    return () => el.removeEventListener(type, handler, opts);
}

export function validateForm(formData) {
    const errors = [];
    
    // Helper function for validation
    const addError = (message) => errors.push(message);
    
    // Required fields
    if (!formData.patientId) addError('Patient ID is required');
    if (!formData.woundId) addError('Wound ID is required');
    if (!formData.assessmentDate) addError('Assessment Date is required');
    
    // Date validation
    const assessmentDate = new Date(formData.assessmentDate);
    const today = new Date();
    if (isNaN(assessmentDate.getTime())) {
        addError('Invalid assessment date');
    } else if (assessmentDate > today) {
        addError('Assessment date cannot be in the future');
    }
    
    // Numeric validations
    const numericFields = ['length', 'width', 'depth'];
    numericFields.forEach(field => {
        if (formData[field] && isNaN(parseFloat(formData[field]))) {
            addError(`${field.charAt(0).toUpperCase() + field.slice(1)} must be a valid number`);
        }
    });
    
    return errors;
}

export function sanitizeInput(value) {
    if (typeof value !== 'string') return value;
    
    // Basic XSS prevention
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
