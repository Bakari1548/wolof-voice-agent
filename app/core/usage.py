"""
Compteur d'appels Google Gemini.

Le compteur est persisté dans un fichier JSON et réinitialisé chaque jour.
Il permet de suivre la consommation du quota gratuit (par défaut 20 appels/jour).
"""

import json
import os
import threading
from datetime import date

_USAGE_FILE = "gemini_usage.json"
_LOCK = threading.Lock()
_DAILY_LIMIT = int(os.getenv("GEMINI_DAILY_LIMIT", "20"))


def _default() -> dict:
    return {"date": str(date.today()), "count": 0}


def _read_usage() -> dict:
    if not os.path.exists(_USAGE_FILE):
        return _default()
    try:
        with open(_USAGE_FILE, "r") as f:
            data = json.load(f)
        if data.get("date") != str(date.today()):
            return _default()
        data.setdefault("count", 0)
        return data
    except Exception:
        return _default()


def _write_usage(data: dict) -> None:
    try:
        with open(_USAGE_FILE, "w") as f:
            json.dump(data, f)
    except Exception:
        pass


def increment_gemini_calls(n: int = 1) -> int:
    """Incrémente le compteur d'appels Gemini de n et renvoie le nouveau total."""
    with _LOCK:
        data = _read_usage()
        data["count"] += n
        _write_usage(data)
        return data["count"]


def get_gemini_usage() -> dict:
    """Renvoie la consommation courante {date, count, limit}."""
    data = _read_usage()
    return {"date": data["date"], "count": data["count"], "limit": _DAILY_LIMIT}
