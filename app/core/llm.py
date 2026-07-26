"""
Initialisation des modèles LLM.
- get_llm() : modèle dédié à l'agent de raisonnement (Gemini ou Groq).
- get_translation_llm() : modèle dédié à la traduction wolof <-> français (Gemini).
Singletons pour éviter de recréer les clients à chaque appel.
"""

from langchain.chat_models import init_chat_model
from google.genai.errors import ServerError
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.config import settings

try:
    from groq import APIError as GroqAPIError
except ImportError:
    GroqAPIError = None

RETRY_EXCEPTIONS = (ServerError,)
if GroqAPIError is not None:
    RETRY_EXCEPTIONS += (GroqAPIError,)

_llm = None
_translation_llm = None


def get_llm():
    """Renvoie l'instance partagée du modèle agent (LLM_PROVIDER / LLM_MODEL)."""
    global _llm
    if _llm is None:
        _llm = init_chat_model(settings.LLM_MODEL, model_provider=settings.LLM_PROVIDER)
    return _llm


def get_translation_llm():
    """Renvoie l'instance partagée du modèle de traduction (TRANSLATION_MODEL)."""
    global _translation_llm
    if _translation_llm is None:
        _translation_llm = init_chat_model(settings.TRANSLATION_MODEL, model_provider="google_genai")
    return _translation_llm


def invoke_with_retry(runnable, *args, **kwargs):
    """Appelle runnable.invoke() avec retry en cas d'indisponibilité Gemini (503)."""
    @retry(
        retry=retry_if_exception_type(RETRY_EXCEPTIONS),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True,
    )
    def _invoke():
        return runnable.invoke(*args, **kwargs)

    return _invoke()
