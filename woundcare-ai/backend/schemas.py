from __future__ import annotations
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, UUID4, constr

PatientId = constr(pattern=r"^[A-Za-z0-9-]{3,64}$")
Requester = Literal['demo', 'qa', 'clinician']

class Scope(BaseModel):
    patient_id: PatientId
    session_id: UUID4
    requester: Requester

class Eval(BaseModel):
    wound_type: Literal['ulcer', 'surgical', 'burn', 'other']
    severity: Literal['low', 'moderate', 'high']
    exudate_level: Literal['none', 'low', 'moderate', 'high']
    infection_signs: bool
    pain_level: Literal['none', 'mild', 'moderate', 'severe']
    necrosis: bool
    location: Optional[str] = None
    notes: Optional[str] = None

class DressingItem(BaseModel):
    id: str
    name: str
    category: Literal['non_occlusive', 'foam', 'pad', 'gauze', 'film']
    absorbency: Literal['none', 'low', 'moderate', 'high']
    occlusive: bool
    adhesive: bool

class RecommendRequest(BaseModel):
    scope: Scope
    eval: Eval
    available_dressings: List[DressingItem]

class SuggestedDressing(BaseModel):
    id: str
    name: str
    note: str
    # Minimal attributes preserved (other attributes omitted in lite variant)

class Flags(BaseModel):
    blocked_content: bool = False
    contains_only_generic: bool = True
    pii: bool = False

class Recommendation(BaseModel):
    allowed: bool
    title: str
    plan_steps: List[str]
    flags: Flags
    risk_score: float
    pii_hits: List[str]
    suggested_dressings: List[SuggestedDressing]
    disclaimer: str
    provenance: Optional[dict] = None  # restore provenance field
    care_plan: Optional[dict] = None   # dual exposure (fix base)

class PlanResult(BaseModel):
    recommendation: Recommendation
    audit_id: UUID4
    care_plan: Optional[dict] = None  # top-level exposure
