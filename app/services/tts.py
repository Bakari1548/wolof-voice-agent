"""
Text-to-Speech : texte wolof -> fichier audio.

Implémentation avec Oolel-Voices (Soynade Research, Hugging Face), qui gère
nativement le wolof et le mélange wolof/français, avec clonage de voix à
partir d'un court échantillon audio ("voice prompt").

TODO avant mise en prod :
  - Fournir un échantillon de voix représentatif dans
    settings.TTS_VOICE_SAMPLE_PATH (6s+ de voix claire) pour caler le style
    de la voix générée.
  - Envisager un cache audio pour les réponses fréquentes (FAQ) afin de
    réduire la latence et les coûts de calcul.
"""

import importlib.util
import sys
import uuid
import os

import torchaudio
from huggingface_hub import snapshot_download
from transformers import AutoModel

from app.config import settings

_tts_model = None  # lazy-loaded, singleton


def _get_tts_model():
    global _tts_model
    if _tts_model is None:
        model_path = snapshot_download(repo_id="soynade-research/Oolel-Voices")

        # Oolel-Voices charge du code custom. Son modeling_oolel_voices.py
        # importe "configuration_oolel_voices" par un import absolu ; on
        # s'assure que ce module est déjà dans sys.modules avant que
        # AutoModel ne lance l'exécution du modeling.
        config_path = os.path.join(model_path, "configuration_oolel_voices.py")
        if os.path.exists(config_path) and "configuration_oolel_voices" not in sys.modules:
            spec = importlib.util.spec_from_file_location(
                "configuration_oolel_voices", config_path
            )
            config_module = importlib.util.module_from_spec(spec)
            sys.modules["configuration_oolel_voices"] = config_module
            spec.loader.exec_module(config_module)

        _tts_model = AutoModel.from_pretrained(model_path, trust_remote_code=True)
    return _tts_model


def synthesize_speech(text_wolof: str) -> str:
    """
    Génère un fichier audio à partir du texte wolof.
    Renvoie le chemin du fichier audio généré.
    """
    if not os.path.exists(settings.TTS_VOICE_SAMPLE_PATH):
        raise FileNotFoundError(
            f"Échantillon voix manquant : {settings.TTS_VOICE_SAMPLE_PATH}"
        )

    # On vérifie l'échantillon avant de charger le modèle (qui est très lourd).
    model = _get_tts_model()

    output_path = os.path.join(
        settings.TMP_AUDIO_DIR, f"response_{uuid.uuid4().hex}.wav"
    )

    wav = model.generate(
        text_wolof,
        audio_prompt_path=settings.TTS_VOICE_SAMPLE_PATH,
        cfg_weight=0.5,
        exaggeration=0.2,
        temperature=0.3,
    )
    torchaudio.save(output_path, wav, model.sr)

    return output_path
