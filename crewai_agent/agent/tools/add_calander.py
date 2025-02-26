from datetime import date, timedelta
import os
from typing import Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager
from utils.constants import FrontendState

class AddCalanderToolInput(BaseModel):
    """Input schema for AddCalanderTool."""
    title: str = Field(..., description="Title of the booking")
    start: date = Field(..., description="Start date of the booking")
    end: date = Field(..., description="End date of the booking")

class AddCalanderTool(BaseTool):
    name: str = "AddCalanderTool"
    description: str = "Adds a booking to the calander."
    args_schema: Type[BaseModel] = AddCalanderToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, title: str, start: date, end: date) -> str:
        try:
            # Get the access token for authentication
            user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)
            access_token = asgardeo_manager.get_user_google_token(user_id, ["openid", "create_bookings"])

            # Format dates as 'YYYY-MM-DD'
            start_date = start.isoformat()
            # Add 1 day to end date since Google Calendar's end.date is exclusive
            end_date = (end + timedelta(days=1)).isoformat()

            # Construct the event body
            event = {
                "summary": title,
                "start": {"date": start_date},
                "end": {"date": end_date}
            }

            # Set up headers with the access token
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            # Make the API request
            response = requests.post(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                headers=headers,
                json=event
            )

            # Check the response
            if response.status_code == 200:
                event_id = response.json().get("id")
                return f"Event created successfully with ID: {event_id}"
            else:
                return f"Failed to create event: {response.status_code} {response.text}"

        except requests.exceptions.RequestException as e:
            return f"Error making request: {str(e)}"
        except Exception as e:
            return f"Unexpected error: {str(e)}"


