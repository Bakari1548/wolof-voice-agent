# Wolof Voice Agent — Squelette (LangGraph + Groq/Gemini)

Pipeline : **App mobile (audio wolof) → STT Dikkte → texte wolof → traduction wolof→français →
agent LangGraph (Groq) avec tools par domaine métier → traduction
français→wolof → TTS Oolel → audio renvoyé**.

Les actions irréversibles (créer une commande, annuler une commande,
initier un paiement) déclenchent une **demande de confirmation explicite**
via le mécanisme `interrupt` de LangGraph, avant exécution réelle.

## Structure

```
app/
  main.py                  # FastAPI : /voice-query, /debug/text-query, /confirm
  config.py                # config centralisée (.env)
  core/
    llm.py                 # init du modèle agent (Groq ou Gemini, singleton)
    db.py                  # client MongoDB partagé (utilisé par le checkpointer)
  graph/
    state.py               # AgentState : état partagé du graphe
    prompts.py              # system prompt (langage simple, oral)
    nodes.py                 # noeuds : appel agent, exécution des tools
    builder.py               # construction du StateGraph + checkpointer MongoDB
  tools/                     # tools de l'agent, un fichier par domaine métier
    catalogue.py             # rechercher_produit, obtenir_prix, verifier_disponibilite
    commande.py              # panier (RAM), creer_commande, statut, annuler (avec interrupt)
    livraison.py             # estimer_delai, verifier_zone_couverte
    paiement.py              # lister_moyens_paiement, initier_paiement (avec interrupt)
    navigation.py            # expliquer_ecran
    support.py               # repondre_faq
  models/schemas.py          # schémas Pydantic
  services/
    stt.py                   # audio -> texte (dikkte HF wolof, Whisper local ou ElevenLabs)
    translation.py            # wolof <-> français via Gemini
    agent_runner.py            # façade d'appel au graphe (invoke / confirm)
    tts.py                     # texte wolof -> audio (Oolel-Voices)
```

## Démarrage rapide

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# remplis GOOGLE_API_KEY, MONGO_URI, etc.

uvicorn app.main:app --reload --port 8002
```

Tester sans audio (le temps de brancher STT/TTS) :

```bash
curl -X POST http://localhost:8002/debug/text-query \
  -H "Content-Type: application/json" \
  -d '{"user_id": "u1", "text_wolof": "Ban jamono la mburu bi di dem?"}'
```

Si la réponse a `"type": "confirmation_requise"`, confirme (ou annule) avec :

```bash
curl -X POST http://localhost:8002/confirm \
  -H "Content-Type: application/json" \
  -d '{"user_id": "u1", "accepted": true}'
```

## Ce qu'il reste à faire (marqué "TODO" dans le code)

1. **`app/tools/*.py`** : remplacer les données mockées par de vraies
   requêtes MongoDB une fois le schéma des collections défini.

2. **`app/services/tts.py`** : modèle TTS Oolel-Voices branché.
   Il gère le wolof et le mélange wolof/français. Alternative : xTTS-v2
   fine-tuné wolof (GalsenAI).

3. **`app/services/stt.py`** : modèle Dikkte (`utachicodes/dikkte-wolof-asr`)
   utilisé par défaut pour le wolof. `whisper_local` et `elevenlabs` restent
   disponibles. Le point critique reste le code-switching wolof/français.

4. **Panier** : actuellement en mémoire de session (RAM). À migrer vers
   MongoDB si la persistance entre redémarrages devient nécessaire.

5. **Sécurité / prod** : ajouter authentification sur l'API, limiter la
   taille des fichiers audio uploadés, gérer le nettoyage périodique de
   `TMP_AUDIO_DIR`, ajouter du logging structuré.

6. **App mobile** : implémenter l'enregistrement audio, l'upload vers
   `/voice-query`, la gestion du flux de confirmation (`/confirm`), et la
   lecture du fichier audio renvoyé (`audio_url`).

## Notes de design

- **Traduction en 2 étapes** (wolof → français → wolof) via 2 appels
  Gemini séparés (`TRANSLATION_MODEL`, Google Gemini) : simplifie le debug (`transcript_french`,
  `answer_french` dans la réponse API) et donne un contrôle indépendant
  sur chaque sens de traduction.
- **Séparation des LLM** : Gemini alimente uniquement la traduction ;
  l'agent de raisonnement utilise Groq (`LLM_PROVIDER=groq`, `LLM_MODEL`).
  `LLM_PROVIDER` peut être basculé sur `google_genai` si besoin.
- **Un agent unique, tools organisés par domaine** : pas de
  multi-agents/MCP pour l'instant, mais chaque fichier de `app/tools/`
  est déjà isolé par domaine métier pour faciliter une évolution future
  vers un système multi-agents (superviseur + agents spécialisés) ou une
  exposition via serveurs MCP indépendants.
- **Confirmation via `interrupt`** : les tools irréversibles
  (`creer_commande`, `annuler_commande`, `initier_paiement`) appellent
  `interrupt(...)` (LangGraph) pour suspendre le graphe et renvoyer une
  demande de confirmation au client. L'endpoint `/confirm` reprend
  l'exécution via `Command(resume=...)`.
- **Mémoire persistante** : le graphe est compilé avec un
  `MongoDBSaver` (checkpointer), `thread_id = user_id` → une conversation
  continue par utilisateur, stockée dans MongoDB.

---

## Interface React de test

Un frontend léger est disponible dans `frontend/`. Il permet de tester l'API en mode texte (`/debug/text-query`) et voix (`/voice-query`) depuis le navigateur.

```bash
cd frontend
npm install
npm run dev
```

Ouvre `http://localhost:5173`.

Le backend doit tourner sur `http://localhost:8002` (CORS déjà activé dans `app/main.py`).
