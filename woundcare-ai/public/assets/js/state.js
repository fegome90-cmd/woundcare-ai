// Initial state template
const initialState = {
    patientId: null,
    woundId: null,
    assessmentDate: new Date().toISOString().split('T')[0],
    images: [],
    timerValues: {},
    formData: {},
    errors: []
};

// Current state
let state = { ...initialState };

// Optional: Add state change listeners
const listeners = new Set();

/**
 * Get a deep copy of the current state
 * @returns {Object} Current state
 */
export function getState() {
    return JSON.parse(JSON.stringify(state));
}

/**
 * Update a specific key in the state
 * @param {string} key - The state key to update
 * @param {any} value - The new value
 * @returns {Object} Updated state
 */
export function updateState(key, value) {
    if (!(key in state)) {
        console.warn(`Warning: Creating new state key "${key}" that wasn't in initial state`);
    }
    
    const oldValue = state[key];
    state = {
        ...state,
        [key]: value
    };
    
    // Notify listeners if value actually changed
    if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        notifyListeners(key, value, oldValue);
    }
    
    return state;
}

/**
 * Reset the state to initial values
 * @param {string[]} [exclude] - Optional array of keys to preserve
 */
export function resetState(exclude = []) {
    const preserved = {};
    if (exclude.length > 0) {
        exclude.forEach(key => {
            preserved[key] = state[key];
        });
    }
    
    state = {
        ...initialState,
        ...preserved,
        assessmentDate: new Date().toISOString().split('T')[0] // Always use current date
    };
    
    notifyListeners('reset', state, null);
    return state;
}

/**
 * Subscribe to state changes
 * @param {Function} listener - Callback function(key, newValue, oldValue)
 * @returns {Function} Unsubscribe function
 */
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Internal: Notify all listeners of state changes
 * @private
 */
function notifyListeners(key, newValue, oldValue) {
    listeners.forEach(listener => {
        try {
            listener(key, newValue, oldValue);
        } catch (error) {
            console.error('Error in state change listener:', error);
        }
    });
}
