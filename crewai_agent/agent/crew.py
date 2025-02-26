import os
from crewai import Agent, Task, Crew, LLM, Process
from dotenv import load_dotenv
from schemas import CrewOutput
from tools.add_calander import AddCalanderTool
from tools.booking import BookingTool
from tools.booking_confirmation import BookingConfirmationTool
from tools.fetch_booking import FetchBookingsTool
from tools.fetch_chat_history import FetchChatHistoryTool
from tools.fetch_hotels import FetchHotelsTool
from tools.fetch_rooms import FetchRoomsTool
from tools.search_rooms import SearchRoomsTool
from utils.state_manager import state_manager

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
        tools=[FetchHotelsTool(thread_id), FetchRoomsTool(thread_id), SearchRoomsTool(thread_id), BookingConfirmationTool(thread_id), BookingTool(thread_id), FetchChatHistoryTool(thread_id), FetchBookingsTool(thread_id), AddCalanderTool(thread_id)]
    )
    flow_state = state_manager.get_states_as_string(thread_id)
    chat_history_task = Task(
        description=
            f"""
            This is the user message : **{question}**.

            You are a specialized assistant whose job is to produce a **concise, self-contained message** and indicate 
            the user’s current conversation state for a "Booking" process.

            You have only access to the **FetchChatHistoryTool**, which can retrieve the conversation history if 
            you need more context.

            Follow these steps:

            1. **Check if you have enough context** from the current conversation. If not, call **FetchChatHistoryTool** 
            to retrieve past messages.

            2. **Identify the user’s current conversation state** 
                - This might be inferred from the user’s most recent request, any previously captured context, or any 
                    partial actions they have already taken (like viewing room options).

            3. **Construct a concise, refined summary** that includes:
                - The **conversation state** (a short label).
                - All critical user requirements—such as dates, location, budget, room preferences, **all ids** or any special requests.

            4. **Do NOT solve the booking request** yourself. Your job is only to create a “handoff message” that the 
            downstream Booking assistant can use to proceed with the reservation steps.

            5. In your **chat_response**:
                - Provide the final summarized message, including the conversation state, that will be passed along.
                - Do not include raw conversation transcripts or any unrelated commentary.
            """
        ,
        agent=hotel_agent,
        expected_output=(
            "Well structured message that captures all crucial information (ids, dates, preferences, location, etc.) "
        ),
    )
    agent_task = Task(
        description=
        f"""
            This is the current flow state of the user: **{flow_state}**.

            You are a specialized assistant for a hotel booking service. You have access to these tools:
            - FetchHotelsTool
            - FetchRoomsTool
            - BookingConfirmationTool
            - BookingTool
            - FetchBookingsTool
            - AddCalendarTool

            Your job is to help the user book a hotel while following these guidelines:

            ---

            ## Stage-Based Flow

            ### 1. Initial or Hotel Search
            - **If the user wants to find or book a room**:
            - Use **FetchHotelsTool** to retrieve a list of hotels that match user preferences (destination, budget, etc.).
            - Use **FetchRoomsTool** to retrieve room options for the selected hotels.
            - Analyze the user’s preferences and provide a concise summary of at least two recommended hotels using clear formatting (e.g., Markdown).
            - Use **FetchRoomsTool** for the currently selected hotel by yourself.
            - Evaluate which rooms best match the user’s stated preferences (budget, bed type, amenities, etc.).
            - Present a concise summary of at least two recommended room options using clear formatting (e.g., Markdown).
            - Make sure to include all the room details in tool_response.

            ### 3. Finalize The Booking and Await Confirmation
            - **When the user wants final pricing or disclaimers**:
            - Call **BookingConfirmationTool** (ensure check-in/check-out dates are known; otherwise prompt for dates).
            - If you get an error, revert please check the room id is correct or not. Then search the room and find the details.
            - In `chat_response`, provide only a high-level summary (e.g., “Here are your booking details... Please confirm if you want to proceed”).
            - In `tool_response`, supply the *authorization_url* and any relevant detail from the booking confirmation tool.
        

            ### 4. Do the Booking
            - Never do the booking without current flow state of the user is not contains "BOOKING_CONFIRMATION_INITIATED".
            - Do not proceed without explicit user confirmation.
            - **If the user says “Yes, book it!”**:
            - Call **BookingTool** to finalize the reservation.
            - If room not found error occurs, please check the details first like hotel and room.
            - If any errors occur, revert to the previous step for booking confirmation.
            - Include a clear booking summary in the `chat_response` (formatted in Markdown). 

            ### 5. Post-Booking
            - **If the user asks for booking details**:
            - Call **FetchBookingsTool** to retrieve the relevant reservation by booking ID.
            - Return booking details in `chat_response`.
            - **If the user wants to add the booking to their calendar**:
            - Call **FetchBookingsTool** (to confirm the booking details).
            - Then call **AddCalendarTool** to add the reservation to their calendar.
            - Summarize the result in `chat_response`.

            ---

            ## Handling Changes Mid-Flow

            - If the user **changes their mind** (e.g., different hotel, different dates) **before** booking is finalized:
            1. **Acknowledge** the change in preference.  
            2. **Reset or adjust** relevant context fields.  
            3. **Repeat** only the necessary steps (like fetching hotels again if the user wants a new city or new budget).
            - If the user **cancels** after booking is finalized, handle according to your policy (cancellation flow, partial refund, or new search).

            ---

            ## Important Notes
            - **Always wait** for the user’s clear confirmation after showing pre-booking details.  
            - **Never finalize** without explicit user approval (“Yes, book it!”).  
            - Use the **minimum necessary** tools for each stage to avoid repetition.  
            - Summaries go to `chat_response`; keep tool outputs or authorization URLs in `tool_response`. 
            - Do not modify frontend_state come from the tools and assume frontend_state by yourself.
            - Provide short, structured summaries in Markdown for clarity (e.g., lists for room types, bullet points for amenities).  
            - Do **not** perform any unrelated actions or use tools outside the booking scope.

            ---

            By following this staged approach, you ensure a smooth user experience without re-fetching or re-asking for details at every turn, while still allowing the user to change their mind or adjust their booking details at any point in the conversation.

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
