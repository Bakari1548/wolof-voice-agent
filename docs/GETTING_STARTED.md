# Getting Started — Wolof Voice Agent

Guide rapide pour installer, configurer et exécuter l'agent vocal wolof en local.

---

## 1. Prérequis

- **Python** 3.10 ou supérieur (testé avec Python 3.14).
- **Git**
- **MongoDB** (optionnel : l'application peut fonctionner avec `MemorySaver` si MongoDB n'est pas dispo).
- Une clé **Google Gemini** (`GOOGLE_API_KEY`).
- Un token **Hugging Face** (`HF_TOKEN`) fortement recommandé pour accélérer le téléchargement du modèle TTS.
- Un échantillon audio `.wav` de 6+ secondes pour le clonage de voix.

---

## 2. Installation

```bash
# 1. Cloner le projet (si ce n'est pas déjà fait)
cd "ESPACE DE TRAVAIL/ESPACE PERSO/wolof-voice-agent"

# 2. Créer un environnement virtuel
python3 -m venv venv

# 3. Activer l'environnement virtuel
source venv/bin/activate

# 4. Installer les dépendances
pip install -r requirements.txt

# 5. Créer le fichier de configuration
cp .env.example .env
```

---

## 3. Configuration (.env)

Édite le fichier `.env` et renseigne au minimum :

```bash
# Google Gemini (obligatoire)
GOOGLE_API_KEY=ta_cle_gemini
LLM_MODEL=gemini-3.5-flash

# Hugging Face (fortement recommandé)
HF_TOKEN=hf_...

# MongoDB (optionnel)
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=assistabt_voices_db

# TTS
TTS_PROVIDER=oolel
TTS_VOICE_SAMPLE_PATH=app/assets/voice_sample.wav
```

> Le token Hugging Face se crée ici : [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

---

## 4. Démarrer MongoDB (optionnel)

Si tu veux une mémoire persistante :

```bash
sudo dnf install -y mongodb mongodb-server   # Fedora
sudo systemctl enable --now mongod
mongosh --eval 'db.runCommand({ping:1})'
```

Si MongoDB n'est pas lancé, l'application bascule automatiquement sur une mémoire en RAM (`MemorySaver`).

---

## 5. Fournir l'échantillon de voix

Place un fichier audio de 6+ secondes (voix claire, sans bruit) à :

```text
app/assets/voice_sample.wav
```

---

## 6. Pré-télécharger le modèle TTS

Cette étape évite que la première requête HTTP ne timeout pendant le téléchargement d'Oolel-Voices.

```bash
python - <<'PY'
from app.services.tts import _get_tts_model
_get_tts_model()
print("modèle TTS prêt")
PY
```

Le modèle est stocké dans :

```text
~/.cache/huggingface/hub/models--soynade-research--Oolel-Voices/
```

---

## 7. Lancer le serveur

```bash
set -a
source .env
set +a

python -m uvicorn app.main:app
```

---

## 8. Tester l'application

### Health check

```bash
curl -s http://127.0.0.1:8000/health
```

### Pipeline complet texte

```bash
curl -s -m 180 -X POST http://127.0.0.1:8000/debug/text-query \
  -H 'Content-Type: application/json' \
  -d '{"user_id":"u1","text_wolof":"Am guen sukkar?"}'
```

Réponse attendue (avec `audio_url` rempli après le premier chargement) :

```json
{
  "type": "reponse",
  "transcript_wolof": "Naata le prix bu suukar bi?",
  "transcript_french": "Quel est le prix du sucre ?",
  "answer_french": "Le sucre en poudre de un kilo coûte huit cents XOF.",
  "answer_wolof": "Kilo sukur gu nòll bi day jar juróom-netti téeméeri CFA.",
  "audio_url": "/audio/response_xxxxxxxx.wav",
  "confirmation_details": null
}
```

---

## 9. Dépannage courant

| Problème | Cause probable | Solution |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'configuration_oolel_voices'` | Import absolu du code custom d'Oolel | Corrigé dans `app/services/tts.py` : le config est pré-chargé |
| `ModuleNotFoundError: No module named 'omegaconf'` | Dépendance manquante du modèle | `venv/bin/pip install omegaconf` |
| `Fetching 109 files: 0%` puis timeout | Pas de `HF_TOKEN` ou connexion HF lente | Ajoute `HF_TOKEN` dans `.env` |
| Port 8000 déjà utilisé | Ancien process uvicorn | `pkill -f 'uvicorn app.main'` |
| Pas d'audio généré (`audio_url: ""`) | Échantillon voix manquant | Vérifie `app/assets/voice_sample.wav` |

---

## 10. Architecture rapide

```text
texte wolof
    ↓
Traduction (wolof → français) via Gemini
    ↓
Agent LangGraph + outils (catalogue, commande, livraison, paiement, etc.)
    ↓
Traduction (français → wolof) via Gemini
    ↓
TTS Oolel-Voices avec clonage de voix
    ↓
fichier audio /audio/response_*.wav
```

---

## 11. Fichiers importants

- `app/main.py` — points d'entrée FastAPI
- `app/config.py` — variables d'environnement
- `app/services/tts.py` — TTS Oolel
- `app/services/translation.py` — Wolof ↔ Français
- `app/graph/builder.py` — LangGraph avec checkpointer MongoDB/MemorySaver
- `app/tools/*.py` — outils métier (catalogue, commande, livraison, paiement, etc.)

---

## 12. Quota Google Gemini et persistance MongoDB

### Quota Gemini

Sur le plan gratuit Google Gemini, `gemini-3.5-flash` est limité à environ **20 requêtes par jour**.

Si tu obtiens une réponse `Internal Server Error` alors que tout semble bien démarré, vérifie les logs du serveur : tu y verras probablement une erreur `429 RESOURCE_EXHAUSTED`.

Solutions :

- Attendre le reset du quota (24 h).
- Utiliser une autre clé `GOOGLE_API_KEY`.
- Passer à un plan payant ou à un autre modèle (`LLM_MODEL` dans `.env`).

### Que stocke MongoDB ?

MongoDB stocke deux types de documents :

1. **`checkpoints`** — états LangGraph (messages, `current_screen`, `pending_action`, etc.) pour reprendre les conversations.
2. **`api_responses`** — réponses API telles que renvoyées par le serveur (`/debug/text-query`, `/voice-query`, `/confirm`), enrichies de `user_id`, `current_screen` et `created_at`.

Exemple de checkpoint :

```json
{
  "_id": "...",
  "thread_id": "u1",
  "checkpoint_id": "...",
  "checkpoint": "<blob msgpack encodé en base64>",
  "metadata": { "source": "msgpack", "step": "..." },
  "type": "msgpack"
}
```

Exemple de réponse API persistée (`api_responses`) :

```json
{
  "_id": "...",
  "user_id": "u1",
  "current_screen": null,
  "created_at": "2026-07-20T15:00:00+00:00",
  "type": "reponse",
  "transcript_wolof": "Naata le prix bu suukar bi?",
  "transcript_french": "Quel est le prix du sucre ?",
  "answer_french": "...",
  "answer_wolof": "...",
  "audio_url": "/audio/response_xxxxxxxx.wav",
  "confirmation_details": null
}
```

Si MongoDB n'est pas disponible, les réponses API ne sont pas persistées mais le pipeline continue de fonctionner.
