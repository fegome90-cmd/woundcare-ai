import { register } from './registry.js';
import { RecommenderRenderer, TipsModule, DemoFiller } from './contracts.js';

class DefaultRenderer extends RecommenderRenderer {
  render(rec) {
    const container = document.createElement('div');
    container.className = 'space-y-3';
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold';
    title.textContent = rec.title || 'Recomendación';
    container.appendChild(title);

    const ul = document.createElement('ul');
    ul.className = 'list-disc pl-5 text-sm';
    (rec.plan_steps || []).forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      ul.appendChild(li);
    });
    container.appendChild(ul);

    if (rec.suggested_dressings?.length) {
      const dd = document.createElement('div');
      dd.className = 'text-sm';
      dd.innerHTML = `<strong>Productos sugeridos:</strong> ${rec.suggested_dressings.map(x => x.name).join(', ')}`;
      container.appendChild(dd);
    }

    if (rec.disclaimer) {
      const d = document.createElement('p');
      d.className = 'text-xs text-gray-500';
      d.textContent = rec.disclaimer;
      container.appendChild(d);
    }

    return container;
  }
}

class DefaultTips extends TipsModule {
  tips(rec) {
    const tips = [];
    if (rec.risk_score === 'high') tips.push('Eleve prioridad de control y derivación.');
    if (rec.flags?.pii) tips.push('Revise y elimine PII antes de guardar.');
    return tips;
  }
}

class DefaultDemoFiller extends DemoFiller {
  fill(form) {
    // Best-effort randomizer using current controls; doesn’t depend on fixed IDs.
    form.querySelectorAll('input[type="range"]').forEach(r => {
      const min = Number(r.min || 0);
      const max = Number(r.max || 5);
      r.value = String(Math.floor(Math.random() * (max - min + 1)) + min);
      r.dispatchEvent(new Event('input', { bubbles: true }));
      r.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const radios = form.querySelectorAll('input[type="radio"]');
    if (radios.length) radios[Math.floor(Math.random() * radios.length)].click();
    const selects = form.querySelectorAll('select');
    selects.forEach(s => {
      if (s.options.length > 1) {
        s.selectedIndex = Math.floor(Math.random() * s.options.length);
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
}

export function registerBuiltins() {
  register('render.rec.default', () => new DefaultRenderer(), { kind: 'render', description: 'Simple DOM renderer' });
  register('tips.default', () => new DefaultTips(), { kind: 'tips', description: 'Heuristic UI tips' });
  register('demo.fill.default', () => new DefaultDemoFiller(), { kind: 'demo', description: 'Form random filler' });
}
