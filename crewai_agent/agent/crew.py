import os
from crewai import Agent, Task, Crew, LLM
from dotenv import load_dotenv
from schemas import CrewOutput
from tools.get_preferences import GetUserPreferencesTool
from tools.search_rooms import SearchRoomsTool

load_dotenv()


def create_crew(question, thread_id: str = None):
    llm = LLM(model='azure/gpt4-o')
    hotel_agent = Agent(
        role='Hotel Assistant Agent',
        goal=(
            "Answer the given question using your tools without modifying the question itself. "
            "Until the user explicitly asks to book a room, share information about Asgardeo Hotel and its services. "
            "If any tool returns one of the states ['get_preferences', 'show_rooms'], indicate that in your response. "
            "You are allowed to modify the chat_response to communicate with the user. "
            "Do not include detailed room information in the chat_response; provide such details in the tool_response instead."
        ),
        backstory=(
            "You are the Hotel Assistant Agent for Asgardeo Hotel. You have access to a language model "
            "and a set of tools to help answer questions and assist with hotel bookings. Asgardeo Hotels "
            "offer the finest Sri Lankan hospitality and blend seamlessly with nature, creating luxurious experiences. "
            "Our rooms immerse you in a world of their own, and our signature dining transports you to another realm—"
            "ensuring a stay that is always memorable. We welcome every guest with warmth and a tropical embrace, making "
            "them feel at home. As guests explore our island, they will be accompanied by the smiles of our people, "
            "through its many natural and historical wonders. While we value our rich legacies, we also carefully preserve "
            "our exotic habitat for the future. We share this home with the world and with one another, united by warmth "
            "and compassion."
        ),
        verbose=True,
        llm=llm,
        tools=[GetUserPreferencesTool(), SearchRoomsTool(thread_id)]
    )
    agent_task = Task(
        description=(
            f"Answer the question: {question}. "
            "Do not modify the question in any way. "
            "Until the user explicitly asks to book a room, share information about Asgardeo Hotel and its services and do not use any tool. You can return empty as frontend_state."
            "If the check-in date, check-out date, or location are not provided, invoke the 'GetUserPreferencesTool' tool. "
            "Otherwise, skip the 'get_preferences' tool and invoke the 'SearchRoomsTool' tool. "
            "Do not include tool response like room details in the chat_response provide such details in the tool_response instead. Use chat_response reponse as a way to communicate with the user."
        ),
        agent=hotel_agent,
        expected_output=(
            f"The output should follow the schema below: {CrewOutput.model_json_schema()}. "
            "Set the 'frontend_state' based on the tool's output. "
            "You may adjust the chat_response as necessary to communicate with the user."
        ),
        output_json=CrewOutput
    )
    choreo_crew = Crew(
    agents=[hotel_agent],
    tasks=[agent_task]
    )
    return choreo_crew.kickoff()
