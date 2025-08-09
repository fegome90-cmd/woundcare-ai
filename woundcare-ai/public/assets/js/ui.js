// Cache system dark mode preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export function injectComponents() {
    return Promise.all([
        injectPartial("#nav", "components/nav.html"),
        injectPartial("#patient-header", "components/patient-header.html"),
    injectPartial("#timersop", "components/timersop-panel.html"),
    injectPartial("#wound-thumb", "components/wound-thumbnail.html"),
    injectPartial("#modal-root", "components/recommendation-modal.html")
    ]);
}

export async function injectPartial(selector, url) {
    const host = document.querySelector(selector);
    if (!host) {
        console.error(`Element not found: ${selector}`);
        return;
    }
    try {
    // Fetch with a timeout to avoid hanging UI
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { cache: 'no-cache', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    host.innerHTML = await res.text();
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
    host.innerHTML = `<div class="p-3 rounded bg-red-50 text-red-700 text-sm">No se pudo cargar: ${url}</div>`;
    }
}

export function setupDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const html = document.documentElement;
    
    // Check system preference first
    if (prefersDark.matches) {
        html.classList.add('dark');
    }
    
    // Then check stored preference (overrides system)
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
        html.classList.toggle('dark', storedTheme === 'dark');
    }
    
    // Set up toggle button
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', 
                html.classList.contains('dark') ? 'dark' : 'light'
            );
        });
    }
    
    // Listen for system changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            html.classList.toggle('dark', e.matches);
        }
    });
}

export function showError(message, duration = 5000) {
    const errorContainer = document.getElementById('form-errors');
    const errorMessage = document.getElementById('form-errors-msg');
    
    if (!errorContainer || !errorMessage) return;
    
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
    
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
        errorContainer.classList.add('active');
    });

    setTimeout(() => {
        errorContainer.classList.remove('active');
        setTimeout(() => {
            errorContainer.classList.add('hidden');
        }, 300); // Match transition duration
    }, duration);
}

export function showSuccess(message, duration = 3000) {
    const successContainer = document.createElement('div');
    successContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300';
    successContainer.textContent = message;
    
    document.body.appendChild(successContainer);
    
    requestAnimationFrame(() => {
        successContainer.style.opacity = '1';
    });
    
    setTimeout(() => {
        successContainer.style.opacity = '0';
        setTimeout(() => {
            successContainer.remove();
        }, 300);
    }, duration);
}

// Helpers to wire up UI behaviors after components are injected
export function setupRangeInputs() {
    const bindings = [
        { id: 'odor', labelId: 'odor-value' },
        { id: 'bleeding', labelId: 'bleeding-value' },
        { id: 'pain', labelId: 'pain-value' },
    ];
    bindings.forEach(({ id, labelId }) => {
        const input = document.getElementById(id);
        const label = document.getElementById(labelId);
        if (input && label) {
            label.textContent = input.value;
            input.addEventListener('input', () => {
                label.textContent = input.value;
            });
        }
    });
}

export function setupDemoFill() {
    const btn = document.getElementById('demo-fill-btn');
    if (!btn) return;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    btn.addEventListener('click', () => {
        // Selects
        const tissue = document.getElementById('tissue');
        const moisture = document.getElementById('moisture');
        const edge = document.getElementById('edge');
        const surrounding = document.getElementById('surrounding');
        if (tissue) tissue.value = pick(['Epitelial','Granulacion','Esfacelo','Necrosis']);
        if (moisture) moisture.value = pick(['Bajo','Moderado','Alto']);
        if (edge) edge.value = pick(['Integrados','No-avanzado','Retractil']);
        if (surrounding) surrounding.value = pick(['Intacta','Eritema','Macerada']);
        // Radios
        const infection = pick(['Si','No']);
        const remains = pick(['Si','No']);
        const infRadio = document.querySelector(`input[name="infection"][value="${infection}"]`);
        const remRadio = document.querySelector(`input[name="remains"][value="${remains}"]`);
        if (infRadio) infRadio.checked = true;
        if (remRadio) remRadio.checked = true;
        // Ranges 0..5
        const ranges = [
            { id: 'odor', label: 'odor-value' },
            { id: 'bleeding', label: 'bleeding-value' },
            { id: 'pain', label: 'pain-value' },
        ];
        ranges.forEach(({ id, label }) => {
            const el = document.getElementById(id);
            const lb = document.getElementById(label);
            if (el && lb) {
                el.value = String(Math.floor(Math.random() * 6));
                lb.textContent = el.value;
            }
        });
        // Measurements
        const length = document.getElementById('length');
        const width = document.getElementById('width');
        const depth = document.getElementById('depth');
        if (length) length.value = (Math.random() * 5 + 1).toFixed(1);
        if (width) width.value = (Math.random() * 5 + 1).toFixed(1);
        if (depth) depth.value = (Math.random() * 1 + 0.1).toFixed(1);
    });
}

export function setupRecommendation() {
    const btn = document.getElementById('recommendation-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const modal = document.getElementById('recommendation-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        requestAnimationFrame(() => modal.classList.add('active'));

        const content = document.getElementById('recommendation-content');
        const planBtn = document.getElementById('care-plan-btn');
        if (content) {
            content.innerHTML = `
                <div id="loading-spinner" class="flex flex-col items-center justify-center py-12">
                    <div class="loader mb-4"></div>
                    <p class="text-gray-600 dark:text-gray-400">Generando recomendaciones...</p>
                </div>`;
        }

        // Build evaluation from form
        const form = document.getElementById('wound-assessment-form');
        const fd = new FormData(form);
        const evaluation = {
            tissue: fd.get('tissue') || '',
            infection: fd.get('infection') || 'No',
            moisture: fd.get('moisture') || '',
            edge: fd.get('edge') || '',
            remains: fd.get('remains') || 'No',
            surrounding: fd.get('surrounding') || '',
            odor: Number(document.getElementById('odor')?.value || 0),
            bleeding: Number(document.getElementById('bleeding')?.value || 0),
            pain: Number(document.getElementById('pain')?.value || 0),
        };

        const { buildRecommendations } = await import('./recommendation.js');
        const result = buildRecommendations(evaluation);

        const chip = (txt) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">${txt}</span>`;
        const contraChip = (txt) => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2 mb-2">${txt}</span>`;

        const productCard = (p) => `
            <div class="p-4 rounded-xl shadow ${p.enabled ? 'bg-gray-50 hover:shadow-md cursor-pointer' : 'bg-gray-100 opacity-60 cursor-not-allowed'} transition" data-product-id="${p.id}" data-enabled="${p.enabled}">
                <div class="flex items-start justify-between">
                    <div>
                        <h4 class="font-semibold text-gray-800">${p.name}</h4>
                        <p class="text-sm text-gray-600 mt-1">${p.description}</p>
                    </div>
                    ${p.enabled ? '' : '<span class="text-xs text-red-600 font-medium">Contraindicado</span>'}
                </div>
                <div class="mt-3 flex flex-wrap">
                    ${p.reason ? chip(p.reason) : ''}
                    ${p.contraindication ? contraChip(p.contraindication) : ''}
                </div>
            </div>`;

        const paramsBlock = `
            <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
                <div><span class="font-semibold">Tejido:</span> ${evaluation.tissue || '-'}</div>
                <div><span class="font-semibold">Infección:</span> ${evaluation.infection}</div>
                <div><span class="font-semibold">Humedad:</span> ${evaluation.moisture || '-'}</div>
                <div><span class="font-semibold">Borde:</span> ${evaluation.edge || '-'}</div>
                <div><span class="font-semibold">Restos:</span> ${evaluation.remains}</div>
                <div><span class="font-semibold">Piel Circundante:</span> ${evaluation.surrounding || '-'}</div>
                <div><span class="font-semibold">Olor:</span> ${evaluation.odor}</div>
                <div><span class="font-semibold">Sangrado:</span> ${evaluation.bleeding}</div>
            </div>`;

        const productsGrid = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${result.products.map(productCard).join('')}
            </div>`;

        const tips = result.careTips.length
            ? `<div class="mt-6">
                <h4 class="text-lg font-semibold text-gray-800">Cuidados de la piel</h4>
                ${result.careTips.map(t => `
                    <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                        <div class="font-medium text-amber-900">${t.title}</div>
                        <ul class="list-disc pl-5 text-sm text-amber-900 mt-1">
                            ${t.content.map(li => `<li>${li}</li>`).join('')}
                        </ul>
                    </div>`).join('')}
              </div>`
            : '';

        if (content) {
            content.innerHTML = `
                <div class="space-y-6">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Parámetros de Evaluación</h4>
                        <div class="mt-2">${paramsBlock}</div>
                    </div>
                    <div>
                        <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Productos Recomendados</h4>
                        <p class="text-sm text-gray-500">Haz clic para seleccionar o deseleccionar. Los contraindicados aparecen deshabilitados.</p>
                        <div class="mt-3">${productsGrid}</div>
                    </div>
                    ${tips}
                </div>`;

            // Enable selection toggling for enabled products
            content.querySelectorAll('[data-product-id]')?.forEach((card) => {
                const enabled = card.getAttribute('data-enabled') === 'true';
                if (!enabled) return;
                card.addEventListener('click', () => {
                    card.classList.toggle('ring-2');
                    card.classList.toggle('ring-blue-500');
                    card.classList.toggle('bg-blue-50');
                });
            });
        }

        if (planBtn) planBtn.disabled = false;
    });
}

// Make range inputs (0..5) respond to clicks on the track consistently
export function enhanceRangeBehavior() {
    const toNumber = (v, d) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
    };
    const setFromEvent = (el, e) => {
        const rect = el.getBoundingClientRect();
        const clientX = e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const min = toNumber(el.min, 0);
        const max = toNumber(el.max, 100);
        const step = toNumber(el.step, 1) || 1;
        const raw = min + (x / rect.width) * (max - min);
        const snapped = Math.round(raw / step) * step;
        const value = Math.min(max, Math.max(min, snapped));
        const prev = el.value;
        el.value = String(value);
        if (prev !== el.value) {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };
    document.querySelectorAll('input[type="range"]').forEach((el) => {
        let dragging = false;
        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            dragging = true;
            setFromEvent(el, e);
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!dragging) return;
            setFromEvent(el, e);
        };
        const onMouseUp = () => { dragging = false; };
        el.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        el.addEventListener('click', (e) => setFromEvent(el, e));
        // Touch support
        el.addEventListener('touchstart', (e) => setFromEvent(el, e), { passive: true });
        el.addEventListener('touchmove', (e) => setFromEvent(el, e), { passive: true });
        el.addEventListener('touchend', () => {});
    });
}
