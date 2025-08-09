"""
Module System (modsys)
----------------------
Lightweight plugin/registry layer to enable swapping and composing backend capabilities
without rewriting the FastAPI service or core engine.

This package is intentionally minimal and dependency-free, using ABCs and
simple registries so it works on Python 3.9+.
"""

from .registry import get_registry, ModRegistry

__all__ = [
    "get_registry",
    "ModRegistry",
]
