"""
Tools "livraison" — estimation de délai, vérification de zone couverte.
Phase 1 : données mockées.
"""

from langchain_core.tools import tool

_ZONES_COUVERTES = {"dakar": 1, "thies": 2, "saint-louis": 3}


@tool
def estimer_delai(zone: str) -> dict:
    """Estime le délai de livraison (en jours) pour une zone donnée."""
    jours = _ZONES_COUVERTES.get(zone.lower())
    if jours is None:
        return {"error": f"Zone non couverte ou inconnue : {zone}"}
    return {"zone": zone, "delai_jours": jours}


@tool
def verifier_zone_couverte(zone: str) -> dict:
    """Vérifie si une zone est couverte par la livraison."""
    couverte = zone.lower() in _ZONES_COUVERTES
    return {"zone": zone, "couverte": couverte}
