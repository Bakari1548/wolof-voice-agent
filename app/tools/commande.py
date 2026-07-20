"""
Tools "commande" — panier (en mémoire de session), création/statut/annulation
de commande.

Phase 1 :
  - le panier est stocké en RAM (dict indexé par user_id), pas en MongoDB.
  - les commandes sont mockées en mémoire.
  - créer/annuler une commande sont des actions irréversibles : elles passent
    par `interrupt()` (LangGraph) pour demander une confirmation explicite
    avant exécution réelle.
"""

import uuid
from langchain_core.tools import tool
from langgraph.types import interrupt

_PANIERS: dict[str, list[dict]] = {}
_COMMANDES: dict[str, dict] = {}


@tool
def ajouter_au_panier(user_id: str, produit_id: str, quantite: int) -> dict:
    """Ajoute un produit au panier de l'utilisateur et renvoie l'état du panier."""
    panier = _PANIERS.setdefault(user_id, [])
    panier.append({"produit_id": produit_id, "quantite": quantite})
    return {"panier": panier}


@tool
def creer_commande(user_id: str) -> dict:
    """Crée une commande à partir du panier de l'utilisateur.

    Action irréversible : demande une confirmation avant exécution.
    """
    panier = _PANIERS.get(user_id, [])
    if not panier:
        return {"error": "Le panier est vide, impossible de créer une commande."}

    confirmation = interrupt(
        {
            "type": "confirmation_requise",
            "action": "creer_commande",
            "details": {"user_id": user_id, "panier": panier},
        }
    )
    if not confirmation:
        return {"status": "annule", "message": "Création de commande annulée par l'utilisateur."}

    commande_id = uuid.uuid4().hex[:8]
    commande = {
        "commande_id": commande_id,
        "user_id": user_id,
        "articles": panier,
        "statut": "confirmee",
    }
    _COMMANDES[commande_id] = commande
    _PANIERS[user_id] = []
    return {"commande": commande}


@tool
def consulter_statut_commande(commande_id: str) -> dict:
    """Renvoie le statut d'une commande à partir de son identifiant."""
    commande = _COMMANDES.get(commande_id)
    if not commande:
        return {"error": f"Aucune commande trouvée avec l'ID {commande_id}"}
    return {"commande": commande}


@tool
def annuler_commande(commande_id: str) -> dict:
    """Annule une commande existante.

    Action irréversible : demande une confirmation avant exécution.
    """
    commande = _COMMANDES.get(commande_id)
    if not commande:
        return {"error": f"Aucune commande trouvée avec l'ID {commande_id}"}

    confirmation = interrupt(
        {
            "type": "confirmation_requise",
            "action": "annuler_commande",
            "details": {"commande_id": commande_id},
        }
    )
    if not confirmation:
        return {"status": "annule", "message": "Annulation abandonnée."}

    commande["statut"] = "annulee"
    return {"commande": commande}
