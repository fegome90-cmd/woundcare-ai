from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.engine import compute_risk as _compute_risk
from backend.engine import rank_dressings as _rank_dressings
from backend.policy import validate_text_policy as _validate_text_policy
from backend.pii import scan_pii as _scan_pii
from backend.schemas import Eval, Recommendation, RecommendRequest, SuggestedDressing

from .contracts import EngineModule, PlannerModule, PolicyModule, PIIModule, RankerModule


class PolicyAdapter(PolicyModule):
    def check(self, text: Optional[str]) -> Dict[str, Any]:
        blocked, generic = _validate_text_policy(text)
        return {"blocked_content": blocked, "contains_only_generic": generic}


class PIIAdapter(PIIModule):
    def scan(self, text: Optional[str]) -> Dict[str, bool]:
        return _scan_pii(text)


class EngineAdapter(EngineModule):
    def compute_risk(self, ev: Eval) -> str:
        return _compute_risk(ev)


class RankerAdapter(RankerModule):
    def rank(self, ev: Eval, items: List[Dict[str, Any]]) -> List[SuggestedDressing]:
        return _rank_dressings(ev, items)


class PlannerAdapter(PlannerModule):
    def plan(self, req: RecommendRequest, risk: str, suggestions: List[SuggestedDressing]) -> Recommendation:
        # The current planner lives inside service.py. We keep this adapter simple so that
        # swapping strategies later is trivial.
        # The service will assemble Recommendation using this signature for consistency.
        raise NotImplementedError("PlannerAdapter is a placeholder; planning remains in service.py for now.")
