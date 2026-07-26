"""
Speech-to-Text : audio (wolof, éventuellement mélangé français) -> texte.

Deux implémentations au choix (voir config.STT_PROVIDER) :
  - whisper_local : faster-whisper, tourne sur ton propre serveur/GPU
  - dikkte wolof : modèle Hugging Face pour le wolof

TODO avant mise en prod :
  - Tester les deux avec de vrais enregistrements de tes utilisateurs cibles
    (le code-switching wolof/français est le principal risque d'erreur).
  - Ajouter un pré-traitement audio (normalisation volume, réduction de bruit)
    si les enregistrements viennent d'un environnement bruyant.
"""

import logging
import os
import subprocess

from app.config import settings

_logger = logging.getLogger(__name__)
_whisper_model = None  # lazy-loaded, singleton
_dikkte_pipe = None  # lazy-loaded, singleton


def _convert_to_wav(input_path: str):
    """Convertit n'importe quel format audio en WAV 16kHz mono via ffmpeg."""
    wav_path = input_path + ".wav"
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                input_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                "-c:a",
                "pcm_s16le",
                wav_path,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return wav_path
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        _logger.warning("Conversion ffmpeg impossible (%s), utilisation du fichier brut", exc)
        return None


def _get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel

        _logger.info("Chargement du modèle Whisper '%s' sur CPU (int8)...", settings.WHISPER_MODEL_SIZE)
        # device="cuda" si tu as un GPU, sinon "cpu"
        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL_SIZE, device="cpu", compute_type="int8"
        )
    return _whisper_model


def transcribe_whisper_local(audio_path: str) -> str:
    model = _get_whisper_model()
    lang = settings.STT_LANGUAGE or None
    wav_path = None

    try:
        if not audio_path.lower().endswith(".wav"):
            wav_path = _convert_to_wav(audio_path)
            if wav_path:
                audio_path = wav_path

        try:
            segments, info = model.transcribe(audio_path, language=lang, beam_size=5)
        except (ValueError, KeyError):
            _logger.warning(
                "Langue STT '%s' non supportée, passage en auto-détection",
                lang,
            )
            segments, info = model.transcribe(audio_path, language=None, beam_size=5)

        text = " ".join(segment.text.strip() for segment in segments)
        _logger.info(
            "STT langue détectée : %s (proba %.2f, durée %.1fs) | langue forcée : %s",
            info.language,
            info.language_probability,
            getattr(info, "duration", 0.0),
            lang,
        )
        all_probs = getattr(info, "all_language_probs", None)
        if all_probs:
            if hasattr(all_probs, "items"):
                items = all_probs.items()
            else:
                items = all_probs
            top3 = sorted(items, key=lambda x: x[1], reverse=True)[:3]
            _logger.info("STT top 3 langues probables : %s", top3)
        return text
    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)


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


def _get_dikkte_pipe():
    global _dikkte_pipe
    if _dikkte_pipe is None:
        from transformers import pipeline

        _logger.info("Chargement du modèle Dikkte '%s'...", settings.HF_STT_MODEL)
        _dikkte_pipe = pipeline(
            "automatic-speech-recognition",
            model=settings.HF_STT_MODEL,
            device="cpu",
        )
    return _dikkte_pipe


def transcribe_dikkte(audio_path: str) -> str:
    """Transcription via le modèle Hugging Face Dikkte (wolof)."""
    pipe = _get_dikkte_pipe()
    wav_path = None

    try:
        if not audio_path.lower().endswith(".wav"):
            wav_path = _convert_to_wav(audio_path)
            if wav_path:
                audio_path = wav_path

        result = pipe(audio_path)
        if isinstance(result, dict):
            return result.get("text", "")
        return str(result)
    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)


def transcribe_audio(audio_path: str) -> str:
    """Point d'entrée unique utilisé par le reste de l'app."""
    if settings.STT_PROVIDER == "elevenlabs":
        return transcribe_elevenlabs(audio_path)
    if settings.STT_PROVIDER == "dikkte":
        return transcribe_dikkte(audio_path)
    return transcribe_whisper_local(audio_path)
