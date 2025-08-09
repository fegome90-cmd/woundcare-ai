import { injectComponents, setupDarkMode, showError, showSuccess } from "./ui.js";
import { getState, updateState } from "./state.js";
import { setupModalEvents } from "./modal.js";
import { setupImageUpload } from "./images.js";
import { validateForm } from "./validators.js";

// Add loading styles
const style = document.createElement('style');
style.textContent = `
  .loading::before {
    content: '';
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 9999;
  }
  .loading::after {
    content: 'Loading...';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    font-size: 1.2rem;
    color: #1e3a8a;
  }
`;
document.head.appendChild(style);

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = {
        patientId: formData.get('patientId'),
        woundId: formData.get('woundId'),
        assessmentDate: formData.get('assessmentDate'),
        measurements: {
            length: formData.get('length'),
            width: formData.get('width'),
            depth: formData.get('depth')
        },
        timers: {
            cleaning: formData.get('cleaningTime'),
            treatment: formData.get('treatmentTime')
        },
        assessment: {
            tissue: formData.get('tissue'),
            infection: formData.get('infection'),
            moisture: formData.get('moisture'),
            edge: formData.get('edge'),
            remains: formData.get('remains'),
            surrounding: formData.get('surrounding'),
            odor: formData.get('odor'),
            bleeding: formData.get('bleeding'),
            pain: formData.get('pain')
        }
    };
    
    try {
        const response = await fetch('api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...data,
                images: getState().images
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg';
        message.textContent = 'Assessment saved successfully';
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
        
        // Reset form and state
        form.reset();
        updateState('images', []);
        const preview = document.getElementById('image-preview');
        if (preview) preview.innerHTML = '';
        
    } catch (error) {
        console.error('Submit error:', error);
        showError('Failed to save assessment. Please try again.');
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Show loading state
        document.body.classList.add('loading');
        
        // Load all components
        await injectComponents();
        
    // Initialize dark mode AFTER components so the toggle button exists
    setupDarkMode();
        
        // Set initial values
        const today = new Date().toISOString().split('T')[0];
    updateState('assessmentDate', today);
    const dateInput = document.getElementById('assessment-date-input');
    if (dateInput) dateInput.value = today;
    const headerDate = document.getElementById('assessment-date');
    if (headerDate) headerDate.textContent = today;
        
        // Set up event handlers
        setupImageUpload();
        setupModalEvents();
        // New helpers for demo UX
        import("./ui.js").then(({ setupRangeInputs, setupDemoFill, setupRecommendation, enhanceRangeBehavior }) => {
            setupRangeInputs();
            enhanceRangeBehavior();
            setupDemoFill();
            setupRecommendation();
        });
        
        // Set up form submission
        const form = document.getElementById('wound-assessment-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
    // Enable recommendation button
        const recommendationBtn = document.getElementById('recommendation-btn');
        if (recommendationBtn) {
            recommendationBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Failed to load application:', error);
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center p-8">
                    <h1 class="text-2xl font-bold text-red-600 mb-4">Application Load Error</h1>
                    <p class="text-gray-600 dark:text-gray-400">Please refresh the page or contact support if the problem persists.</p>
                    <button onclick="window.location.reload()" 
                            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800">
                        Reload Page
                    </button>
                </div>
            </div>`;
    } finally {
        document.body.classList.remove('loading');
    }
});
