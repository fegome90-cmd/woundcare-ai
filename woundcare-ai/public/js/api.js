export async function recommendPlan(payload, { baseUrl = 'http://localhost:8088' } = {}) {
  const res = await fetch(`${baseUrl}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function health({ baseUrl = 'http://localhost:8088' } = {}) {
  const res = await fetch(`${baseUrl}/healthz`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
