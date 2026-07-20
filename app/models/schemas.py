from typing import Any, Dict, Optional

from pydantic import BaseModel


class VoiceQueryResponse(BaseModel):
    """Réponse renvoyée à l'app mobile après traitement (complet ou partiel) du pipeline."""

    type: str                                      # "reponse" ou "confirmation_requise"
    transcript_wolof: str                          # ce que l'utilisateur a dit (wolof), vide pour /confirm
    transcript_french: str                         # traduction utilisée pour le LLM, vide pour /confirm
    answer_french: str                             # réponse (ou question de confirmation) en français
    answer_wolof: str                               # traduction en wolof
    audio_url: str                                  # URL/chemin de l'audio de réponse (TTS)
    confirmation_details: Optional[Dict[str, Any]] = None  # présent si type == "confirmation_requise"


class DebugTranscriptRequest(BaseModel):
    """Utile pour tester le pipeline texte sans passer par l'audio."""

    user_id: str
    text_wolof: str
    current_screen: Optional[str] = None


class ConfirmRequest(BaseModel):
    """Reprend une conversation en attente de confirmation après un interrupt."""

    user_id: str
    accepted: bool
