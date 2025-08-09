// Tiny front-end module registry to allow swapping heuristics/formatters/renderers.
// No bundler required; keep it ESM-friendly.

const _mods = new Map();
const _meta = new Map();

export function register(key, factory, { kind = 'util', version = '0.1.0', description = '' } = {}) {
  _mods.set(key, factory);
  _meta.set(key, { key, kind, version, description });
}

export function get(key) {
  if (!_mods.has(key)) throw new Error(`Module '${key}' is not registered`);
  return _mods.get(key);
}

export function info(key) {
  if (!_meta.has(key)) throw new Error(`Module '${key}' has no metadata`);
  return _meta.get(key);
}

export function list(kind = null) {
  if (!kind) return Array.from(_meta.values());
  return Array.from(_meta.values()).filter(m => m.kind === kind);
}
