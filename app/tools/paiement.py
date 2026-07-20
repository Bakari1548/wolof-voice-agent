"""
Tools "paiement" — moyens de paiement disponibles, initiation de paiement.

Phase 1 : données mockées. Initier un paiement est une action irréversible :
elle passe par `interrupt()` (LangGraph) pour demander une confirmation
explicite avant exécution réelle.
"""

from langchain_core.tools import tool
from langgraph.types import interrupt

_MOYENS_PAIEMENT = ["Orange Money", "Wave", "Paiement à la livraison"]


@tool
def lister_moyens_paiement() -> dict:
    """Liste les moyens de paiement disponibles."""
    return {"moyens": _MOYENS_PAIEMENT}


@tool
def initier_paiement(commande_id: str, moyen: str) -> dict:
    """Initie le paiement d'une commande avec le moyen choisi.

    Action irréversible : demande une confirmation avant exécution.
    """
    if moyen not in _MOYENS_PAIEMENT:
        return {"error": f"Moyen de paiement inconnu : {moyen}"}

    confirmation = interrupt(
        {
            "type": "confirmation_requise",
            "action": "initier_paiement",
            "details": {"commande_id": commande_id, "moyen": moyen},
        }
    )
    if not confirmation:
        return {"status": "annule", "message": "Paiement annulé par l'utilisateur."}

    return {"status": "paiement_initie", "commande_id": commande_id, "moyen": moyen}
