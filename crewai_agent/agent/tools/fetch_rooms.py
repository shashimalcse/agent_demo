from datetime import date
import os
from typing import Type, Optional, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests
from utils.constants import FrontendState

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class FetchRoomsToolInput(BaseModel):
    """Input schema for SearchRoomTool."""
    hotel_id: int = Field(..., description="Id of the hotel")

class FetchRoomsTool(BaseTool):
    name: str = "FetchRoomsTool"
    description: str = "Fetches all rooms of a hotel."
    args_schema: Type[BaseModel] = FetchRoomsToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, hotel_id: int) -> str:

        try: 
            token = asgardeo_manager.get_app_token(["read_rooms"])
        except Exception as e:
            raise

        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        api_response = requests.get(f"{os.environ['HOTEL_API_BASE_URL']}/hotels/{hotel_id}/rooms", headers=headers)
        rooms_data = api_response.json()
        
        response = Response(
            chat_response=None, 
            tool_response=rooms_data
        )
        return CrewOutput(response=response, frontend_state=FrontendState.NO_STATE).model_dump_json()
