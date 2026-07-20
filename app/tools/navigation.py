"""
Tool "navigation" — explication d'un écran de l'app à partir de son
identifiant. Phase 1 : mapping statique écran -> explication.
"""

from langchain_core.tools import tool

_ECRANS = {
    "accueil": "C'est l'écran d'accueil. Tu peux chercher un produit ou voir tes commandes.",
    "panier": "C'est ton panier. Tu peux vérifier les produits ajoutés avant de commander.",
    "paiement": "C'est l'écran de paiement. Choisis un moyen de paiement pour valider ta commande.",
}


@tool
def expliquer_ecran(screen_id: str) -> dict:
    """Explique à quoi sert un écran de l'app et l'action à faire, à partir de son identifiant."""
    explication = _ECRANS.get(screen_id.lower())
    if not explication:
        return {"error": f"Écran inconnu : {screen_id}"}
    return {"screen_id": screen_id, "explication": explication}
