import { getState, updateState } from './state.js';
import { showError } from './utils.js';

export function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export function validateUpload(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!file) {
        throw new Error('No file selected');
    }

    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG or WebP image.');
    }

    if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 5MB.');
    }

    if (file.size === 0) {
        throw new Error('File is empty');
    }
}

export function compressImage(base64) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }
                
                // Target dimensions
                const maxWidth = 800;
                const maxHeight = 800;
                
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', 0.8);
                
                if (!compressed || compressed === 'data:,') {
                    throw new Error('Failed to compress image');
                }
                
                resolve(compressed);
            } catch (error) {
                reject(new Error('Failed to process image: ' + error.message));
            }
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
    });
}

export function setupImageUpload() {
    const uploadInput = document.getElementById('image-upload');
    const preview = document.getElementById('image-preview');
    
    if (!uploadInput || !preview) return;
    
    uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            validateUpload(file);
            
            const base64 = await toBase64(file);
            const compressed = await compressImage(base64);
            
            const state = getState();
            updateState('images', [...state.images, compressed]);
            
            // Create preview thumbnail
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group';
            
            const img = document.createElement('img');
            img.src = compressed;
            img.className = 'w-24 h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
            img.alt = 'Wound image';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
            removeBtn.innerHTML = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
            removeBtn.title = 'Remove image';
            
            removeBtn.addEventListener('click', () => {
                const state = getState();
                const index = state.images.indexOf(compressed);
                if (index > -1) {
                    const newImages = [...state.images];
                    newImages.splice(index, 1);
                    updateState('images', newImages);
                }
                wrapper.remove();
            });
            
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            preview.appendChild(wrapper);
            
        } catch (error) {
            showError(error.message);
        } finally {
            // Reset input to allow uploading the same file again
            uploadInput.value = '';
        }
    });
}
