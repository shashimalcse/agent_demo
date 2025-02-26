from datetime import date
import os
from typing import Type, Optional, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests
from utils.state_manager import state_manager
from utils.constants import FlowState, FrontendState

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class SearchRoomsToolInput(BaseModel):
    """Input schema for SearchRoomTool."""
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    name: str = Field(..., description="Name of the hotel")

class SearchRoomsTool(BaseTool):
    name: str = "SearchRoomsTool"
    description: str = "Search for hotel rooms within check-in and check-out dates."
    args_schema: Type[BaseModel] = SearchRoomsToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, check_in: date, check_out: date, name: str) -> str:
        params = {}
        if check_in is not None:
            params['check_in'] = check_in
        if check_out is not None:
            params['check_out'] = check_out
        if name is not None:
            params['name'] = name     

        try: 
            token = asgardeo_manager.get_app_token(["read_rooms"])
        except Exception as e:
            raise

        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        api_response = requests.get(f"{os.environ['HOTEL_API_BASE_URL']}/rooms/search/", params=params, headers=headers)
        rooms_data = api_response.json()
        state_manager.add_state(self.thread_id, FlowState.SEARCHED_ROOMS)
        # Convert list response to dictionary format
        response_dict = {"rooms": rooms_data, "check_in": check_in, "check_out": check_out} if isinstance(rooms_data, list) else rooms_data
        response = Response(
            chat_response=None, 
            tool_response=response_dict
        )
        return CrewOutput(response=response, frontend_state=FrontendState.NO_STATE).model_dump_json()
