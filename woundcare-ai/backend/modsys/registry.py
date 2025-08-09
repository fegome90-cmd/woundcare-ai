from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional


@dataclass
class ModInfo:
    name: str
    kind: str  # e.g., 'policy', 'pii', 'engine', 'ranker', 'audit'
    version: str = "0.1.0"
    description: str = ""


class ModRegistry:
    """In-memory singleton registry for backend modules.

    Keep it tiny and thread-safe enough for our single-process demo.
    """

    _instance: Optional["ModRegistry"] = None

    def __init__(self) -> None:
        self._mods: Dict[str, Callable[..., Any]] = {}
        self._meta: Dict[str, ModInfo] = {}

    @classmethod
    def instance(cls) -> "ModRegistry":
        if cls._instance is None:
            cls._instance = ModRegistry()
        return cls._instance

    def register(self, key: str, factory: Callable[..., Any], info: ModInfo) -> None:
        if key in self._mods:
            # Allow override for hot-swap in dev, but log intention via description.
            pass
        self._mods[key] = factory
        self._meta[key] = info

    def get(self, key: str) -> Callable[..., Any]:
        if key not in self._mods:
            raise KeyError(f"Module '{key}' is not registered")
        return self._mods[key]

    def info(self, key: str) -> ModInfo:
        if key not in self._meta:
            raise KeyError(f"Module '{key}' has no metadata")
        return self._meta[key]

    def list(self, kind: Optional[str] = None) -> Dict[str, ModInfo]:
        if kind is None:
            return dict(self._meta)
        return {k: v for k, v in self._meta.items() if v.kind == kind}


def get_registry() -> ModRegistry:
    return ModRegistry.instance()
