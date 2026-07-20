"""
Initialisation du modèle LLM (Google Gemini) utilisé par l'agent et la
traduction. Singleton pour éviter de recréer le client à chaque appel.
"""

from langchain.chat_models import init_chat_model
from app.config import settings

_llm = None


def get_llm():
    """Renvoie l'instance partagée du modèle Gemini (sans tools bindés)."""
    global _llm
    if _llm is None:
        _llm = init_chat_model(settings.LLM_MODEL, model_provider="google_genai")
    return _llm
