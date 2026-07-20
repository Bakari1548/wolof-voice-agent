"""
Client MongoDB partagé (connexion unique).

Phase 1 : utilisé par le checkpointer LangGraph (mémoire de conversation
persistante) et par le stockage des réponses API. Les tools métier
(catalogue, commande, etc.) restent mockés pour l'instant -> voir app/tools/.
"""

import logging
from datetime import datetime, timezone

from pymongo import MongoClient
from app.config import settings

_client: MongoClient | None = None


def get_mongo_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGO_URI)
    return _client


def get_db():
    return get_mongo_client()[settings.MONGO_DB_NAME]


def save_api_response(response: dict) -> str | None:
    """
    Persiste une réponse API dans la collection `api_responses`.
    Si MongoDB n'est pas disponible, la fonction échoue silencieusement
    (log warning) pour ne pas bloquer le pipeline.
    """
    try:
        doc = dict(response)
        doc.setdefault("created_at", datetime.now(timezone.utc))
        collection = get_db()["api_responses"]
        result = collection.insert_one(doc)
        return str(result.inserted_id)
    except Exception as exc:
        logging.warning("Impossible de persister la réponse API : %s", exc)
        return None
