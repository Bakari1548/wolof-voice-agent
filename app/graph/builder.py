"""
Construction du StateGraph : noeud agent <-> noeud tools, avec checkpointer
MongoDB pour la mémoire de conversation persistante par utilisateur.
"""

import logging
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
try:
    from langgraph.checkpoint.mongodb import MongoDBSaver
except Exception:  # pragma: no cover
    MongoDBSaver = None

from app.config import settings
from app.core.db import get_mongo_client
from app.graph.nodes import agent_node, tool_node, should_continue
from app.graph.state import AgentState

_compiled_graph = None


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
    graph.add_edge("tools", "agent")

    checkpointer = None
    if MongoDBSaver is not None:
        try:
            client = get_mongo_client()
            client.admin.command("ping")
            checkpointer = MongoDBSaver(client, db_name=settings.MONGO_DB_NAME)
        except Exception as exc:
            logging.warning("MongoDB indisponible, mémoire en RAM utilisée : %s", exc)
    if checkpointer is None:
        checkpointer = MemorySaver()
    return graph.compile(checkpointer=checkpointer)


def get_graph():
    """Renvoie le graphe compilé (singleton)."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph
