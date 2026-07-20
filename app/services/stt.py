"""
Speech-to-Text : audio (wolof, éventuellement mélangé français) -> texte.

Deux implémentations au choix (voir config.STT_PROVIDER) :
  - whisper_local : faster-whisper, tourne sur ton propre serveur/GPU
  - elevenlabs     : API ElevenLabs Scribe (gère le wolof + diarisation)

TODO avant mise en prod :
  - Tester les deux avec de vrais enregistrements de tes utilisateurs cibles
    (le code-switching wolof/français est le principal risque d'erreur).
  - Ajouter un pré-traitement audio (normalisation volume, réduction de bruit)
    si les enregistrements viennent d'un environnement bruyant.
"""

from app.config import settings

_whisper_model = None  # lazy-loaded, singleton


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel

        # device="cuda" si tu as un GPU, sinon "cpu"
        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL_SIZE, device="cpu", compute_type="int8"
        )
    return _whisper_model


def transcribe_whisper_local(audio_path: str) -> str:
    model = _get_whisper_model()
    # language="wo" = code ISO du wolof. Whisper le supporte partiellement ;
    # si la qualité est mauvaise, essaie sans forcer la langue.
    segments, info = model.transcribe(audio_path, language="wo", beam_size=5)
    return " ".join(segment.text.strip() for segment in segments)


def transcribe_elevenlabs(audio_path: str) -> str:
    import requests

    with open(audio_path, "rb") as f:
        response = requests.post(
            "https://api.elevenlabs.io/v1/speech-to-text",
            headers={"xi-api-key": settings.ELEVENLABS_API_KEY},
            files={"file": f},
            data={"model_id": "scribe_v1", "language_code": "wo"},
            timeout=60,
        )
    response.raise_for_status()
    data = response.json()
    return data.get("text", "")


def transcribe_audio(audio_path: str) -> str:
    """Point d'entrée unique utilisé par le reste de l'app."""
    if settings.STT_PROVIDER == "elevenlabs":
        return transcribe_elevenlabs(audio_path)
    return transcribe_whisper_local(audio_path)
