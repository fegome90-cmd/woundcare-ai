from __future__ import annotations
from typing import List
from uuid import uuid4

from .schemas import Eval, DressingItem, SuggestedDressing

ABSORBENCY_SCORE = {
    'high': 3,
    'moderate': 2,
    'low': 1,
    'none': 0,
}


def compute_risk(e: Eval) -> float:
    base = {'low': 0.2, 'moderate': 0.5, 'high': 0.8}[e.severity]
    exu = {'none': 0.0, 'low': 0.05, 'moderate': 0.1, 'high': 0.2}[e.exudate_level]
    inf = 0.15 if e.infection_signs else 0.0
    nec = 0.1 if e.necrosis else 0.0
    return min(1.0, base + exu + inf + nec)


def rank_dressings(e: Eval, items: List[DressingItem]) -> List[SuggestedDressing]:
    ranked: List[tuple[float, DressingItem, str]] = []
    for d in items:
        # Eligibility filters
        if e.infection_signs or e.severity == 'high':
            if d.occlusive:
                # Skip occlusive in high risk/infection
                continue
        if e.pain_level == 'severe' and d.adhesive:
            # Avoid adhesive on severe pain
            continue
        score = ABSORBENCY_SCORE.get(d.absorbency, 0)
        # Prioritize absorbency when exudate moderate/high
        if e.exudate_level in ('moderate', 'high'):
            if d.absorbency == 'high':
                score += 2
            elif d.absorbency == 'moderate':
                score += 1
        # Bonus for non_occlusive
        if d.category == 'non_occlusive':
            score += 1
        # Penalize occlusive slightly (if still passed filters)
        if d.occlusive:
            score -= 1
        note = ""
        if d.category == 'non_occlusive':
            note = 'Cobertura no oclusiva'
        elif d.absorbency in ('high', 'moderate'):
            note = 'Buena absorción'
        ranked.append((score, d, note))
    ranked.sort(key=lambda x: x[0], reverse=True)
    top3 = [SuggestedDressing(id=d.id, name=d.name, note=note) for _, d, note in ranked[:3]]
    return top3
