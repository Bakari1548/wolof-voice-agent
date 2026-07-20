"""
Façade : reçoit le texte français + l'identité de l'utilisateur, invoque le
graphe LangGraph, et renvoie soit la réponse finale, soit une demande de
confirmation (interrupt) à transmettre au client.
"""

from typing import Optional

from langchain_core.messages import HumanMessage
from langgraph.types import Command

from app.graph.builder import get_graph


def _extract_final_text(result: dict) -> str:
    for message in reversed(result["messages"]):
        if message.type == "ai" and message.content:
            content = message.content
            if isinstance(content, list):
                text_parts = [
                    item.get("text", "") for item in content
                    if isinstance(item, dict) and "text" in item
                ]
                return " ".join(text_parts)
            return content
    return ""


def run_agent(user_id: str, text_french: str, current_screen: Optional[str] = None) -> dict:
    """
    Lance (ou poursuit) une conversation pour l'utilisateur donné.

    Renvoie soit {"type": "reponse", "texte": ...}, soit
    {"type": "confirmation_requise", "details": ...} si une action
    irréversible attend confirmation.
    """
    graph = get_graph()
    config = {"configurable": {"thread_id": user_id}}

    state_input = {
        "messages": [HumanMessage(content=text_french)],
        "user_id": user_id,
        "current_screen": current_screen,
        "pending_action": None,
        "locale": "fr",
    }

    result = graph.invoke(state_input, config=config)
    return _shape_result(result)


def confirm_agent(user_id: str, accepted: bool) -> dict:
    """Reprend une conversation en attente de confirmation (après un interrupt)."""
    graph = get_graph()
    config = {"configurable": {"thread_id": user_id}}

    result = graph.invoke(Command(resume=accepted), config=config)
    return _shape_result(result)


def _shape_result(result: dict) -> dict:
    interrupts = result.get("__interrupt__")
    if interrupts:
        return {"type": "confirmation_requise", "details": interrupts[0].value}
    return {"type": "reponse", "texte": _extract_final_text(result)}
