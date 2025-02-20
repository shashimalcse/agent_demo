from langgraph.graph import MessagesState, START
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from copilotkit.langgraph import copilotkit_customize_config
from langgraph.checkpoint.memory import MemorySaver
import requests
from pydantic import BaseModel

@tool
def search_rooms(min_price: float = None, max_price: float = None):
    """
    Search for hotel rooms within a price range.
    
    Args:
        min_price (float, optional): Minimum price per night
        max_price (float, optional): Maximum price per night
        
    Returns:
        List of available rooms matching the criteria
    """
    
    params = {}
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price
        
    response = requests.get('http://localhost:8001/rooms/', params=params)
    return response.json()
    

tools = [search_rooms]
tool_node = ToolNode(tools)

model = ChatGoogleGenerativeAI(model='gemini-1.5-flash')

class AskHuman(BaseModel):
    question: str

model = model.bind_tools(tools + [AskHuman])


def should_continue(state):
    messages = state["messages"]
    last_message = messages[-1]
    if not last_message.tool_calls:
        return "end"
    elif last_message.tool_calls[0]["name"] == "AskHuman":
        return "ask_human"
    else:
        return "continue"


def call_model(state, config):
    config = copilotkit_customize_config(
        config,
        emit_tool_calls="AskHuman",
    )
    messages = state["messages"]
    response = model.invoke(messages, config=config)
    return {"messages": [response]}


def ask_human(state):
    pass


from langgraph.graph import END, StateGraph

workflow = StateGraph(MessagesState)

workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)
workflow.add_node("ask_human", ask_human)

workflow.add_edge(START, "agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "action",
        "ask_human": "ask_human",
        "end": END,
    },
)

workflow.add_edge("action", "agent")
workflow.add_edge("ask_human", "agent")

memory = MemorySaver()

graph = workflow.compile(checkpointer=memory, interrupt_after=["ask_human"])
