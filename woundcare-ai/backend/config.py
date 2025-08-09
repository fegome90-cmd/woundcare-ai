import os

# Feature flags for staged rollout
FEATURE_IA_COLUMN: bool = os.getenv("FEATURE_IA_COLUMN", "false").lower() == "true"
DRY_RUN: bool = os.getenv("DRY_RUN", "true").lower() == "true"

# Optional version tag for health reporting
APP_VERSION: str = os.getenv("APP_VERSION", "0.1.0")

# Catalog flags (read-only service)
CATALOG_SOURCE: str = os.getenv("CATALOG_SOURCE", "none").lower()
CATALOG_JSON_PATH: str = os.getenv("CATALOG_JSON_PATH", "./data/dressings.json")
READ_ONLY_CATALOG: bool = os.getenv("READ_ONLY_CATALOG", "true").lower() == "true"
USE_CATALOG_FOR_RANKING: bool = os.getenv("USE_CATALOG_FOR_RANKING", "false").lower() == "true"

# Telemetry / probes level (0 = off, 1 = lite, 2 = verbose)
_TL = os.getenv("TELEMETRY_LEVEL", "1").strip().lower()
try:
	TELEMETRY_LEVEL: int = int(_TL) if _TL.isdigit() else {"off":0, "lite":1, "std":1, "verbose":2, "2":2}.get(_TL, 1)
except Exception:
	TELEMETRY_LEVEL = 1
