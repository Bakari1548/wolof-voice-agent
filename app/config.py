"""
Configuration centralisée du projet.
Toutes les clés/API sont lues depuis des variables d'environnement (.env)
-> voir .env.example à la racine du projet.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- Google Gemini ---
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    # Modèle dédié à l'agent de raisonnement
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")  # "google_genai" ou "groq"
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    # Modèle dédié à la traduction wolof <-> français
    TRANSLATION_MODEL: str = os.getenv("TRANSLATION_MODEL", "gemini-3.6-flash")

    # --- Groq ---
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # --- STT (Speech-to-Text) ---
    # Choix : "whisper_local" (faster-whisper), "elevenlabs" ou "dikkte" (HF wolof)
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "dikkte")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "small")
    # Langue forcée pour faster-whisper (ex: 'wo', 'fr', ''). Vide = auto-détection.
    STT_LANGUAGE: str = os.getenv("STT_LANGUAGE", "")
    # Modèle Hugging Face ASR utilisé si STT_PROVIDER=dikkte
    HF_STT_MODEL: str = os.getenv("HF_STT_MODEL", "utachicodes/dikkte-wolof-asr")

    # --- TTS (Text-to-Speech) ---
    TTS_PROVIDER: str = os.getenv("TTS_PROVIDER", "oolel")  # "oolel" ou "xtts"
    TTS_VOICE_SAMPLE_PATH: str = os.getenv(
        "TTS_VOICE_SAMPLE_PATH", "app/assets/voice_sample.wav"
    )

    # --- MongoDB ---
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "mydb")

    # --- Audio output ---
    TMP_AUDIO_DIR: str = os.getenv("TMP_AUDIO_DIR", "app/assets/audio")


settings = Settings()

os.makedirs(settings.TMP_AUDIO_DIR, exist_ok=True)

# Clés API injectées dans les variables standards pour les adaptateurs LangChain.
if settings.GOOGLE_API_KEY:
    os.environ.setdefault("GOOGLE_API_KEY", settings.GOOGLE_API_KEY)
if settings.GROQ_API_KEY:
    os.environ.setdefault("GROQ_API_KEY", settings.GROQ_API_KEY)
