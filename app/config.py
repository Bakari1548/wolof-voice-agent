"""
Configuration centralisée du projet.
Toutes les clés/API sont lues depuis des variables d'environnement (.env)
-> voir .env.example à la racine du projet.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- Google Gemini (LLM) ---
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.5-flash")

    # --- STT (Speech-to-Text) ---
    # Choix : "whisper_local" (faster-whisper) ou "elevenlabs"
    STT_PROVIDER: str = os.getenv("STT_PROVIDER", "whisper_local")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "small")

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

# ChatGoogleGenerativeAI (langchain-google-genai) lit la clé depuis cette
# variable d'environnement standard.
if settings.GOOGLE_API_KEY:
    os.environ.setdefault("GOOGLE_API_KEY", settings.GOOGLE_API_KEY)
