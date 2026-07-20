"""
Tools "catalogue & prix" — recherche produit, prix, disponibilité.
Phase 1 : données mockées (à remplacer par de vraies requêtes MongoDB).
"""

from langchain_core.tools import tool

_MOCK_PRODUCTS = [
    {"id": "p1", "nom": "Riz parfumé 5kg", "prix": 4500, "devise": "XOF", "disponible": True},
    {"id": "p2", "nom": "Huile végétale 1L", "prix": 1200, "devise": "XOF", "disponible": True},
    {"id": "p3", "nom": "Sucre en poudre 1kg", "prix": 800, "devise": "XOF", "disponible": False},
]


@tool
def rechercher_produit(nom: str) -> dict:
    """Recherche des produits dont le nom contient le texte donné."""
    resultats = [p for p in _MOCK_PRODUCTS if nom.lower() in p["nom"].lower()]
    if not resultats:
        return {"resultats": [], "message": f"Aucun produit trouvé pour '{nom}'."}
    return {"resultats": resultats}


@tool
def obtenir_prix(produit_id: str) -> dict:
    """Renvoie le prix d'un produit à partir de son identifiant."""
    for p in _MOCK_PRODUCTS:
        if p["id"] == produit_id:
            return {"produit_id": produit_id, "prix": p["prix"], "devise": p["devise"]}
    return {"error": f"Produit inconnu : {produit_id}"}


@tool
def verifier_disponibilite(produit_id: str) -> dict:
    """Vérifie si un produit est actuellement disponible."""
    for p in _MOCK_PRODUCTS:
        if p["id"] == produit_id:
            return {"produit_id": produit_id, "disponible": p["disponible"]}
    return {"error": f"Produit inconnu : {produit_id}"}
