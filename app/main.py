"""
Point d'entrée FastAPI.

Endpoint principal : POST /voice-query
  - reçoit un fichier audio (wolof) depuis l'app mobile
  - fait tourner le pipeline : STT -> traduction -> agent LangGraph (+ tools
    métier) -> traduction -> TTS
  - renvoie la réponse (texte + URL audio), ou une demande de confirmation
    si l'agent a déclenché un interrupt (action irréversible)

Endpoint de confirmation : POST /confirm
  - reprend une conversation en attente de confirmation (après un interrupt)

Endpoint de debug : POST /debug/text-query
  - permet de tester le pipeline SANS passer par l'audio, en envoyant
    directement du texte wolof (utile pendant le développement)

Lancer en local :
    uvicorn app.main:app --reload --port 8002
"""

import logging
import os
import shutil
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core import db
from app.core.usage import get_gemini_usage
from app.models.schemas import VoiceQueryResponse, DebugTranscriptRequest, ConfirmRequest
from app.services import stt, translation, tts, agent_runner

app = FastAPI(title="Wolof Voice Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sert les fichiers audio générés pour que l'app mobile puisse les télécharger
app.mount("/audio", StaticFiles(directory=settings.TMP_AUDIO_DIR), name="audio")


logger = logging.getLogger(__name__)


def _synthesize_or_empty(text_wolof: str) -> str:
    try:
        audio_path = tts.synthesize_speech(text_wolof)
        return f"/audio/{os.path.basename(audio_path)}"
    except Exception as exc:
        logger.warning("TTS non disponible : %s", exc, exc_info=True)
        return ""


def _format_confirmation_message(details: dict) -> str:
    """Transforme la charge utile de l'interrupt en question de confirmation lisible."""
    action = details.get("action")
    d = details.get("details", {})

    if action == "creer_commande":
        return "Veux-tu que je confirme cette commande ? Réponds oui ou non."
    if action == "annuler_commande":
        return f"Veux-tu vraiment annuler la commande {d.get('commande_id', '')} ? Réponds oui ou non."
    if action == "initier_paiement":
        return f"Veux-tu lancer le paiement avec {d.get('moyen', '')} ? Réponds oui ou non."
    return "Confirmes-tu cette action ? Réponds oui ou non."


def _shape_response(result: dict, transcript_wolof: str, transcript_french: str) -> VoiceQueryResponse:
    """Construit la réponse API à partir du résultat de l'agent (réponse finale ou confirmation)."""
    if result["type"] == "confirmation_requise":
        answer_french = _format_confirmation_message(result["details"])
    else:
        answer_french = result["texte"]

    answer_wolof = translation.french_to_wolof(answer_french)
    audio_url = _synthesize_or_empty(answer_wolof)

    return VoiceQueryResponse(
        type=result["type"],
        transcript_wolof=transcript_wolof,
        transcript_french=transcript_french,
        answer_french=answer_french,
        answer_wolof=answer_wolof,
        audio_url=audio_url,
        confirmation_details=result.get("details"),
    )


def _persist_response(user_id: str, current_screen: Optional[str], response: VoiceQueryResponse) -> None:
    """Sauvegarde la réponse API dans MongoDB (collection api_responses)."""
    doc = response.model_dump()
    doc["user_id"] = user_id
    doc["current_screen"] = current_screen
    doc.setdefault("created_at", datetime.now(timezone.utc).isoformat())
    db.save_api_response(doc)


def _run_pipeline(user_id: str, text_wolof: str, current_screen: Optional[str] = None) -> VoiceQueryResponse:
    """Logique partagée entre l'endpoint audio et l'endpoint debug texte."""
    text_french = translation.wolof_to_french(text_wolof)
    result = agent_runner.run_agent(user_id, text_french, current_screen)
    response = _shape_response(result, text_wolof, text_french)
    _persist_response(user_id, current_screen, response)
    return response


@app.post("/voice-query", response_model=VoiceQueryResponse)
async def voice_query(
    user_id: str = Form(...),
    audio_file: UploadFile = File(...),
    current_screen: Optional[str] = Form(None),
):
    """Endpoint principal utilisé par l'app mobile."""

    # Sauvegarde temporaire du fichier audio reçu
    tmp_path = os.path.join(
        settings.TMP_AUDIO_DIR, f"input_{uuid.uuid4().hex}_{audio_file.filename}"
    )
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(audio_file.file, f)

    try:
        text_wolof = stt.transcribe_audio(tmp_path)
        if not text_wolof.strip():
            raise HTTPException(
                status_code=422, detail="Impossible de transcrire l'audio (vide ou inaudible)."
            )
        return _run_pipeline(user_id, text_wolof, current_screen)
    finally:
        os.remove(tmp_path)


@app.post("/debug/text-query", response_model=VoiceQueryResponse)
async def debug_text_query(payload: DebugTranscriptRequest):
    """Endpoint de test : saute la partie STT pour itérer plus vite."""
    return _run_pipeline(payload.user_id, payload.text_wolof, payload.current_screen)


@app.post("/confirm", response_model=VoiceQueryResponse)
async def confirm(payload: ConfirmRequest):
    """Reprend une conversation en attente de confirmation après un interrupt."""
    result = agent_runner.confirm_agent(payload.user_id, payload.accepted)
    response = _shape_response(result, transcript_wolof="", transcript_french="")
    _persist_response(payload.user_id, None, response)
    return response


@app.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 20):
    """Liste les échanges passés de l'utilisateur stockés dans `api_responses`."""
    try:
        collection = db.get_db()["api_responses"]
        cursor = collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        items = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            items.append(doc)
        return items
    except Exception as exc:
        logger.warning("Impossible de charger l'historique : %s", exc)
        raise HTTPException(status_code=503, detail="MongoDB indisponible")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/quota")
async def quota():
    """Renvoie la consommation courante des appels Gemini."""
    return get_gemini_usage()
