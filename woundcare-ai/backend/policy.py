from typing import Tuple, Optional

BLOCKED_KEYWORDS = [
    '100% curación', 'garantizado', 'garantizada', 'dosis', 'dosificación', 'antibiótico',
]


def validate_text_policy(notes: Optional[str]) -> Tuple[bool, bool]:
    """
    Returns (blocked_content, contains_only_generic)
    blocked_content True if forbidden claims/keywords are present.
    contains_only_generic is True unless we detect non-generic patterns.
    """
    if not notes:
        return False, True
    lower = notes.lower()
    blocked = any(k in lower for k in [k.lower() for k in BLOCKED_KEYWORDS])
    # For this Lite demo, we always treat output as generic if allowed
    return blocked, True
