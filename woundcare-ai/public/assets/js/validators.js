export function validateRequired(value, fieldName) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`${fieldName} is required`);
    }
}

export function validateNumber(value, fieldName, min = null, max = null) {
    const num = Number(value);
    
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    
    if (min !== null && num < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    
    if (max !== null && num > max) {
        throw new Error(`${fieldName} must be no more than ${max}`);
    }
}

export function validateDate(value, fieldName) {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date`);
    }
    
    const today = new Date();
    if (date > today) {
        throw new Error(`${fieldName} cannot be in the future`);
    }
}

export function validateForm(formData) {
    const errors = [];
    
    try {
        // Required fields
        validateRequired(formData.patientId, 'Patient ID');
        validateRequired(formData.woundId, 'Wound ID');
        validateRequired(formData.assessmentDate, 'Assessment Date');
        
        // Date validation
        validateDate(formData.assessmentDate, 'Assessment Date');
        
        // Numeric validations
        if (formData.length) {
            validateNumber(formData.length, 'Length', 0, 1000);
        }
        if (formData.width) {
            validateNumber(formData.width, 'Width', 0, 1000);
        }
        if (formData.depth) {
            validateNumber(formData.depth, 'Depth', 0, 1000);
        }
        
        // Timer validations
        Object.entries(formData.timerValues || {}).forEach(([field, value]) => {
            if (value) {
                validateNumber(value, field, 0);
            }
        });
        
    } catch (error) {
        errors.push(error.message);
    }
    
    return errors;
}
