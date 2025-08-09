from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from backend.schemas import Eval, Recommendation, RecommendRequest, SuggestedDressing


class PolicyModule(ABC):
    @abstractmethod
    def check(self, text: Optional[str]) -> Dict[str, Any]:
        """Return dict with keys: blocked_content (bool), contains_only_generic (bool)."""
        raise NotImplementedError


class PIIModule(ABC):
    @abstractmethod
    def scan(self, text: Optional[str]) -> Dict[str, bool]:
        """Return dict with keys: contains_pii (bool), has_email (bool), has_phone (bool), has_rut (bool)."""
        raise NotImplementedError


class EngineModule(ABC):
    @abstractmethod
    def compute_risk(self, ev: Eval) -> str:
        raise NotImplementedError


class RankerModule(ABC):
    @abstractmethod
    def rank(self, ev: Eval, items: List[Dict[str, Any]]) -> List[SuggestedDressing]:
        raise NotImplementedError


class PlannerModule(ABC):
    @abstractmethod
    def plan(self, req: RecommendRequest, risk: str, suggestions: List[SuggestedDressing]) -> Recommendation:
        raise NotImplementedError
