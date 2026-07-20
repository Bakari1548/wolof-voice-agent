"""
Agrège tous les tools disponibles pour l'agent.

Organisé par domaine métier (un fichier par domaine) pour faciliter une
future évolution vers un système multi-agents (agents spécialisés par
domaine) ou une exposition des tools via des serveurs MCP indépendants.
"""

from app.tools.catalogue import rechercher_produit, obtenir_prix, verifier_disponibilite
from app.tools.commande import (
    ajouter_au_panier,
    creer_commande,
    consulter_statut_commande,
    annuler_commande,
)
from app.tools.livraison import estimer_delai, verifier_zone_couverte
from app.tools.paiement import lister_moyens_paiement, initier_paiement
from app.tools.navigation import expliquer_ecran
from app.tools.support import repondre_faq

ALL_TOOLS = [
    rechercher_produit,
    obtenir_prix,
    verifier_disponibilite,
    ajouter_au_panier,
    creer_commande,
    consulter_statut_commande,
    annuler_commande,
    estimer_delai,
    verifier_zone_couverte,
    lister_moyens_paiement,
    initier_paiement,
    expliquer_ecran,
    repondre_faq,
]
