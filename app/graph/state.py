"""
État partagé du graphe LangGraph (AgentState).
"""

from typing import Optional
from typing_extensions import TypedDict, Annotated

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    # Historique de conversation (humain / IA / tool) — cœur du function calling.
    messages: Annotated[list[BaseMessage], add_messages]

    # Identifie l'utilisateur : scope le panier, les commandes, la mémoire.
    user_id: str

    # Identifiant d'écran transmis par le client mobile (tool navigation).
    current_screen: Optional[str]

    # Action irréversible en attente de confirmation (nom tool + args),
    # utilisée en complément du mécanisme interrupt de LangGraph.
    pending_action: Optional[dict]

    # Langue courante ("fr" pour l'instant, l'agent travaille en français).
    locale: str
