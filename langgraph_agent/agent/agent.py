from langgraph.graph import MessagesState, START
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from copilotkit.langgraph import copilotkit_customize_config
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph
from pydantic import BaseModel
from langgraph.errors import NodeInterrupt
import requests

authorize = False

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

@tool
def book_room(user_id: int, room_id: int, check_in: str, check_out: str):
    """
    Book a hotel room for a user.
    
    Args:
        user_id (int): User ID
        room_id (int): Room ID
        check_in (str): Check-in date
        check_out (str): Check-out date
        
    Returns:
        Booking details
    """
    
    data = {
        'user_id': user_id,
        'room_id': room_id,
        'check_in': check_in,
        'check_out': check_out
    }
    
    response = requests.post('http://localhost:8001/bookings/', json=data)
    return response.json()
    

tools = [search_rooms, book_room]
tool_node = ToolNode(tools)

model = ChatGoogleGenerativeAI(model='gemini-1.5-flash')

class AskHuman(BaseModel):
    question: str

model = model.bind_tools(tools + [AskHuman])

def check_auth(state, config):
    return {"auth_url": "/authroize"}


def authorize(state, config):
    """Function to handle tool authorization"""
    if not authorize:
        auth_message = (
            f"Please authorize the application in your browser:\n\n {state.get('auth_url')}"
        )
        raise NodeInterrupt(auth_message)
    
def should_continue(state):
    messages = state["messages"]
    last_message = messages[-1]
    if not last_message.tool_calls:
        return "end"
    elif last_message.tool_calls[0]["name"] == "AskHuman":
        return "ask_human"
    elif last_message.tool_calls[0]["name"] == "book_room":
        return "check_auth"
    else:
        return "continue"


def call_agent(state, config):
    config = copilotkit_customize_config(
        config,
        emit_tool_calls="AskHuman",
    )
    messages = state["messages"]
    response = model.invoke(messages, config=config)
    return {"messages": [response]}


def ask_human(state):
    pass

workflow = StateGraph(MessagesState)

workflow.add_node("agent", call_agent)
workflow.add_node("tools", tool_node)
workflow.add_node("ask_human", ask_human)
workflow.add_node("authorization", authorize)
workflow.add_node("check_auth", check_auth)

workflow.add_edge(START, "agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "continue": "tools",
        "ask_human": "ask_human",
        "check_auth": "check_auth",
        "end": END,
    },
)

workflow.add_edge("tools", "agent")
workflow.add_edge("check_auth", "authorization")
workflow.add_edge("authorization", "tools")
workflow.add_edge("ask_human", "agent")

memory = MemorySaver()

graph = workflow.compile(checkpointer=memory, interrupt_after=["ask_human"])
