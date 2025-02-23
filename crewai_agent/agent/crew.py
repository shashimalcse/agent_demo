import os
from crewai import Agent, Task, Crew, LLM
from dotenv import load_dotenv
from schemas import CrewOutput
from tools.book_rooms import BookRoomsTool
from tools.get_preferences import GetUserPreferencesTool
from tools.search_rooms import SearchRoomsTool

load_dotenv()


def create_crew(question, thread_id: str = None):
    llm = LLM(model='azure/gpt4-o')
    hotel_agent = Agent(
        role='Hotel Assistant Agent',
        goal=(
            "Answer the given question using your tools without modifying the question itself."
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
        tools=[GetUserPreferencesTool(), SearchRoomsTool(thread_id), BookRoomsTool(thread_id)]
    )
    agent_task = Task(
        description=(
            f"Answer the question: {question}. "
            "1. If the user is asking only for general or non-room-related hotel information, respond with relevant details from your backstory. Do not use any tools in that scenario.\n"
            "2. If the user expresses interest in checking room availability, rates, or anything that requires room details, follow these steps:\n"
            "   - Check if location, check-in date, and check-out date are provided.\n"
            "   - If any of these are missing, call 'GetUserPreferencesTool' once to collect them.\n"
            "   - If all preferences are known, call 'SearchRoomsTool' to retrieve available rooms. (do not include room list details in 'chat_response'. Put some nice message about the hotel and say these are the availble rooms only. room details are return with tool_response)\n"
            "3. If the user explicitly says they want to book a room with details, call 'BookRoomsTool'.\n"
            "4. If 'BookRoomsTool' returns 'unauthorize', prompt the user to authenticate using the URL in 'tool_response' (do not include the URL in your 'chat_response').\n"
            "Note: Do not include any information like room list, selected rooms auth URLs in the chat_response. The tool_response is for internal usage. Always use chat_response to give a message to user about the task.\n"
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
