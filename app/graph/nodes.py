"""
Noeuds du graphe LangGraph : appel de l'agent (LLM + tools bindés) et
exécution des tools.
"""

from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode

from app.core.llm import get_llm
from app.core.usage import increment_gemini_calls
from app.graph.prompts import SYSTEM_PROMPT
from app.graph.state import AgentState
from app.tools import ALL_TOOLS

tool_node = ToolNode(ALL_TOOLS)


def agent_node(state: AgentState) -> dict:
    """Appelle le LLM avec l'historique de messages et les tools disponibles."""
    llm_with_tools = get_llm().bind_tools(ALL_TOOLS)

    messages = state["messages"]
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=SYSTEM_PROMPT), *messages]

    increment_gemini_calls(1)
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """Route vers les tools si le dernier message contient des tool_calls, sinon termine."""
    last_message = state["messages"][-1]
    if getattr(last_message, "tool_calls", None):
        return "tools"
    return "end"
