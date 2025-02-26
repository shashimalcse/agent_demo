import os
from crewai import Agent, Task, Crew, LLM, Process
from dotenv import load_dotenv
from schemas import CrewOutput
from tools.add_calander import AddCalanderTool
from tools.booking import BookingTool
from tools.booking_confirmation import BookingConfirmationTool
from tools.fetch_chat_history import FetchChatHistoryTool
from tools.fetch_hotels import FetchHotelsTool
from tools.fetch_rooms import FetchRoomsTool
from tools.search_rooms import SearchRoomsTool

load_dotenv()


def create_crew(question, thread_id: str = None):
    llm = LLM(model='azure/gpt4-o')
    hotel_agent = Agent(
        role='Hotel Assistant Agent',
        goal=(
            "Answer the given question using your tools without modifying the question itself. Please make sure to follow the instructions in the task description. Do not perform any actions outside the scope of the task."
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
        tools=[FetchHotelsTool(thread_id), FetchRoomsTool(thread_id), SearchRoomsTool(thread_id), BookingConfirmationTool(thread_id), BookingTool(thread_id), FetchChatHistoryTool(thread_id), AddCalanderTool(thread_id)]
    )
    chat_history_task = Task(
        description=
            f"""
            This is the user message : **{question}**.
            You are a specialized assistant whose current task is to generate a concise, self-contained message 
            for an upcoming "Booking" task. You have access to a tool called ***FetchChatHistoryTool*, which can retrieve 
            the full conversation history if needed.

            Follow these steps:

            1. If you already have enough context from the current conversation, proceed. If not, call ***FetchChatHistoryTool*
            to retrieve past messages and ensure you understand the user’s intent and any relevant details.

            2. Using the available conversation data (including any retrieved via ***FetchChatHistoryTool*), construct a 
            summarized or refined message that captures all crucial information (dates, preferences, location, etc.) 
            needed for the next booking step.

            3. Do NOT attempt to solve the user's booking request yourself. Your job is only to produce a 
            well-structured, self-contained message containing essential info from the chat so it can be passed to 
            the "Booking" process.

            4. In your chat_response:
            - Provide the final message to be handed off, ensuring clarity and completeness.
            - Exclude any extraneous conversation details not necessary for booking.

            5. If you call ***FetchChatHistoryTool*, place the conversation transcript in tool_response only. 
            Do NOT directly expose raw transcripts or sensitive data in chat_response. Summarize or rephrase 
            as needed for clarity.

            Important:
            - Keep user data private. 
            - Only use the minimal details necessary to complete the next booking step.
            - Do not provide additional commentary or solve the booking request here. 
            """
        ,
        agent=hotel_agent,
        expected_output=(
            "Well structured message that captures all crucial information (dates, preferences, location, etc.) "
        ),
    )
    agent_task = Task(
        description=
        f"""
        You are a specialized assistant for a hotel booking service. Follow these steps:

        1. If the user’s query indicates they want to find or book a hotel:
            - Use FetchHotelsTool to retrieve a list of hotels that match the user’s preferences (destination, budget, etc.).
            - Cross-check each returned hotel’s details against the user’s criteria (location, budget, amenities, etc.). 
            - If no hotels match, politely inform the user. 
            - Otherwise, summarize the suitable options.
            - Next, use FetchRoomsTool to fetch room information for the chosen hotel(s).

        2. Evaluate the room options and you should decide which room types might appeal to the user (considering budget, amenities, bed type, etc.).

        3. Present a concise summary of your recommended hotel and minimum 2 rooms to the user. Use markdown to format the response for detailed information.

        4. If the user selects a specific room and asks for final details (pricing breakdown, disclaimers, etc.),
           call **BookingConfirmationTool**:
            - Make sure the check in and check out dates are given in some point. Otherwise, ask the user for them. You should not assume the dates.
            - This is to show the user a pre-booking summary so they can make an informed decision.
            - Provide only a high-level summary in chat_response (e.g., "Here are your booking details, 
                please confirm if you want to proceed").
            - *authroization_url* and tool_Response should be sent in tool_response to the user. 

        5. You must ALWAYS wait for the user's confirmation AFTER showing them the pre-booking details. 
            It is not ethical to finalize a booking without explicit user approval (they could lose money otherwise).
            - Therefore, only after calling **BookingConfirmationTool**, AND receiving the user’s clear "Yes, book it!", 
            should you proceed.

        5. Once the user explicitly confirms they want to finalize the booking:
            - Call **BookingTool** to place the actual reservation.
            - If BookingTool or any booking-related tool returns "unauthorize," prompt the user to authenticate, 
                but do NOT expose any auth URL in chat_response (only in tool_response).

        Important:
        - Only use these tools when searching or displaying hotel/room information or booking details.
        - Summarize recommendations in chat_response, but keep actual details. Authroization url should be sent in tool_response.
        - Do not perform actions outside the scope of this task.
        """
        ,
        agent=hotel_agent,
        context=[chat_history_task],
        expected_output=f"The output should follow the schema below: {CrewOutput.model_json_schema()}.",
        output_pydantic=CrewOutput
    )
    choreo_crew = Crew(
    agents=[hotel_agent],
    tasks=[chat_history_task, agent_task],
    process=Process.sequential
    )
    return choreo_crew.kickoff()
