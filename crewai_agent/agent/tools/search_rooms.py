from datetime import date
from typing import Type, Optional, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class SearchRoomsToolInput(BaseModel):
    """Input schema for SearchRoomTool."""
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    location: str = Field(..., description="Location of the hotel")

class SearchRoomsTool(BaseTool):
    name: str = "SearchRoomsTool"
    description: str = "Search for hotel rooms within check-in and check-out dates."
    args_schema: Type[BaseModel] = SearchRoomsToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, check_in: date, check_out: date, location: str) -> str:
        params = {}
        if check_in is not None:
            params['check_in'] = check_in
        if check_out is not None:
            params['check_out'] = check_out
        if location is not None:
            params['location'] = location     

        try: 
            token = asgardeo_manager.get_app_token(["readrooms"])
            print(token)
        except Exception as e:
            raise

        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        api_response = requests.get('http://localhost:8001/rooms/search/', params=params, headers=headers)
        rooms_data = api_response.json()
        
        # Convert list response to dictionary format
        response_dict = {"rooms": rooms_data, "check_in": check_in, "check_out": check_out} if isinstance(rooms_data, list) else rooms_data
        response = Response(
            chat_response=None, 
            tool_response=response_dict
        )
        return CrewOutput(response=response, frontend_state="show_rooms").model_dump_json()
