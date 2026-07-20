"""
Tool "support / FAQ" — réponses à des questions générales.
Phase 1 : FAQ statique.
"""

from langchain_core.tools import tool

_FAQ = {
    "livraison": "La livraison prend généralement 1 à 3 jours selon la zone.",
    "paiement": "Tu peux payer avec Orange Money, Wave, ou à la livraison.",
    "retour": "Tu peux demander un retour dans les 48 heures après réception.",
}


@tool
def repondre_faq(question: str) -> dict:
    """Répond à une question générale en cherchant un mot-clé dans la FAQ."""
    q = question.lower()
    for mot_cle, reponse in _FAQ.items():
        if mot_cle in q:
            return {"reponse": reponse}
    return {"reponse": "Je n'ai pas de réponse précise à cette question pour le moment."}
