"""
Traduction wolof <-> français via Gemini.
Deux appels séparés (un par sens) pour garder un contrôle simple sur chaque
étape : tu peux inspecter transcript_french / answer_french dans la réponse
de l'API pour voir exactement ce que le modèle a compris/répondu.
"""

from functools import lru_cache

from langchain_core.messages import HumanMessage

from app.config import settings
from app.core.llm import get_translation_llm, invoke_with_retry
from app.core.usage import increment_gemini_calls


@lru_cache(maxsize=256)
def _translate(text: str, source: str, target: str) -> str:
    if not text.strip():
        return ""
    return _translate_gemini(text, source, target)


def _translate_gemini(text: str, source: str, target: str) -> str:
    prompt = (
        f"Traduis le texte suivant du {source} vers le {target}. "
        f"Réponds UNIQUEMENT avec la traduction, sans aucun commentaire, "
        f"sans guillemets, sans préambule.\n\n"
        f"Texte : {text}"
    )
    increment_gemini_calls(1)
    response = invoke_with_retry(get_translation_llm(), [HumanMessage(content=prompt)])
    content = response.content
    if isinstance(content, list):
        text_parts = [
            item.get("text", "") for item in content
            if isinstance(item, dict) and "text" in item
        ]
        content = " ".join(text_parts)
    if not isinstance(content, str):
        content = str(content)
    return content.strip()


def wolof_to_french(text_wolof: str) -> str:
    return _translate(text_wolof, source="wolof", target="français")


def french_to_wolof(text_french: str) -> str:
    return _translate(text_french, source="français", target="wolof")
