from __future__ import annotations

from .registry import get_registry, ModInfo
from .adapters import PolicyAdapter, PIIAdapter, EngineAdapter, RankerAdapter


def register_builtins() -> None:
    reg = get_registry()

    reg.register(
        key="policy.default",
        factory=lambda: PolicyAdapter(),
        info=ModInfo(name="DefaultTextPolicy", kind="policy", description="Keyword-based content guardrails"),
    )

    reg.register(
        key="pii.default",
        factory=lambda: PIIAdapter(),
        info=ModInfo(name="DefaultPIIScanner", kind="pii", description="Regex-based email/phone/RUT detection"),
    )

    reg.register(
        key="engine.default",
        factory=lambda: EngineAdapter(),
        info=ModInfo(name="DeterministicRiskEngine", kind="engine", description="Deterministic risk categorization"),
    )

    reg.register(
        key="ranker.default",
        factory=lambda: RankerAdapter(),
        info=ModInfo(name="EligibilityRanker", kind="ranker", description="Eligibility + scoring of dressings"),
    )
