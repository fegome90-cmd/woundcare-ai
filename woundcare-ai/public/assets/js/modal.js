function openModal(id) {
    const modal = document.getElementById(id);
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modal || !modalContent) return;
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('active');
        modalContent.classList.add('active');
    }, 10);
    
    document.body.classList.add('overflow-hidden');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modal || !modalContent) return;
    
    modal.classList.remove('active');
    modalContent.classList.remove('active');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        
        // Reset recommendation content if it exists
        if (id === 'recommendation-modal') {
            const content = document.getElementById('recommendation-content');
            if (content) {
                content.innerHTML = `
                    <div id="loading-spinner" class="flex flex-col justify-center items-center py-8">
                        <div class="loader mb-4"></div>
                        <p class="text-gray-600">Generating recommendations...</p>
                    </div>`;
            }
            const planBtn = document.getElementById('care-plan-btn');
            if (planBtn) planBtn.disabled = true;
        }
    }, 300);
}

function setupModalEvents() {
    document.addEventListener('click', (e) => {
        // Close button clicks
        if (e.target.matches('[data-modal-close]')) {
            const modalId = e.target.closest('.modal').id;
            closeModal(modalId);
        }
        
        // Modal trigger clicks
        if (e.target.matches('[data-modal-trigger]')) {
            const modalId = e.target.getAttribute('data-modal-trigger') || e.target.dataset.modalId || e.target.dataset.modalTarget;
            if (modalId) openModal(modalId);
        }
        
        // Background clicks
        if (e.target.matches('.modal-background')) {
            const modalId = e.target.closest('.modal').id;
            closeModal(modalId);
        }
    });
}

export { openModal, closeModal, setupModalEvents };
