import re
from typing import List

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+?56\s?)?(?:9\s?)?\d{8}")
RUT_RE = re.compile(r"\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b|\b\d{7,8}-[\dkK]\b")

PII_LABELS = {
    'EMAIL_ADDRESS': EMAIL_RE,
    'PHONE_NUMBER': PHONE_RE,
    'CL_RUT': RUT_RE,
}

def scan_pii(text: str) -> List[str]:
    if not text:
        return []
    hits: List[str] = []
    for label, regex in PII_LABELS.items():
        if regex.search(text):
            hits.append(label)
    return hits
