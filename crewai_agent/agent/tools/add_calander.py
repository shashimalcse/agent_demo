from datetime import date
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


class AddCalanderTool(BaseTool):
    name: str = "AddCalanderTool"
    description: str = "Adds a booking to the calander."
    args_schema: Type[BaseModel] = AddCalanderToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self) -> str:

        user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)
        authorization_url = asgardeo_manager.get_google_authorization_url(user_id, ["openid", "create_bookings"])
        response = Response(
            chat_response="Please authorize the app to add the booking to your calendar.",
            tool_response={
                "authorization_url": authorization_url
            }
        )
        return CrewOutput(response=response, frontend_state=FrontendState.UNAUTHORIZED).model_dump_json()
