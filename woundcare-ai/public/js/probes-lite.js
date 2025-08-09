// Probes & Monitor (lite)
const API_BASE = (typeof window !== 'undefined' && window.WCA && window.WCA.API_BASE) ? window.WCA.API_BASE.replace(/\/$/,'') : 'http://localhost:8088';
const beacon = document.getElementById('probe-beacon');
const panel = document.getElementById('probe-stats');
let timer;
async function tick(){
  try {
    const [status, metrics] = await Promise.all([
      fetch(`${API_BASE}/status-lite`).then(r=>r.json()),
      fetch(`${API_BASE}/metrics`).then(r=>r.json())
    ]);
    if(beacon){
      const ok = status.status === 'ok';
      beacon.classList.remove('bg-gray-400','bg-red-500','bg-green-500');
      beacon.classList.add(ok ? 'bg-green-500':'bg-red-500');
    }
    if(panel){
      panel.textContent = JSON.stringify({
        status_lite: status,
        metrics: Object.fromEntries(Object.entries(metrics).filter(([k])=>k.startsWith('wca_')||k==='p95_ms'))
      }, null, 2);
    }
  } catch (e){
    if(beacon){
      beacon.classList.remove('bg-green-500');
      beacon.classList.add('bg-red-500');
    }
  }
}
function start(){ tick(); timer = setInterval(tick, 2000); }
window.addEventListener('load', start);
