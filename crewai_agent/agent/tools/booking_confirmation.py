from datetime import date
from typing import Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class BookingConfirmationToolInput(BaseModel):
    """Input schema for BookingConfirmationTool."""
    room_id: int = Field(..., description="Room ID")
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")


class BookingConfirmationTool(BaseTool):
    name: str = "BookingConfirmationTool"
    description: str = "When user selects a room, this tool use to get the room details and confirm the booking."
    args_schema: Type[BaseModel] = BookingConfirmationToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, room_id: int, check_in: date, check_out: date) -> str:
        try:

            user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)
            # Resolve user loyalty points
            try: 
                token = asgardeo_manager.get_app_token(["read_rooms"])
            except Exception as e:
                raise 

            headers = {
                'Authorization': f'Bearer {token}'
            }
            
            api_response = requests.get('http://localhost:8001//users/{user_id}/loyalty', headers=headers)
            user_loylty_data = api_response.json()

            # TODO : Loyalty points will be added to the RAR request

            authorization_url = asgardeo_manager.get_authorization_url(user_id, ["openid", "create_bookings"])

            # Get access token
            try: 
                access_token = asgardeo_manager.get_app_token(["read_rooms"])
            except Exception as e:
                raise

            # Prepare the booking request
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            params = {}
            if check_in is not None:
                params['check_in'] = check_in
            if check_out is not None:
                params['check_out'] = check_out

            api_response = requests.get(f"http://localhost:8001/rooms/{room_id}/details", params=params, headers=headers)
            
            if (api_response.status_code == 200):
                booking_details = api_response.json()
                response_dict = {
                    "room_id": booking_details["room_id"],
                    "room_number": booking_details["room_number"],
                    "room_type": booking_details["room_type"],
                    "room_type_description": booking_details["room_type_description"],
                    "price_per_night": booking_details["price_per_night"],
                    "total_price": booking_details["total_price"],
                    "hotel_id": booking_details["hotel_id"],
                    "hotel_name": booking_details["hotel_name"],
                    "hotel_description": booking_details["hotel_description"],
                    "hotel_rating": booking_details["hotel_rating"],
                    "is_available": booking_details["is_available"],
                    "check_in": booking_details["check_in"],
                    "check_out": booking_details["check_out"]
                }
                message = "Please confirm the booking"
            else:
                response_dict = {
                    "error": api_response.json().get("detail", "Failed to get booking details"),
                    "status": "failed"
                }
                message = f"Failed to get room details: {response_dict['error']}"

            response = Response(
                chat_response=message,
                tool_response={
                    "room_details": response_dict,
                    "authorization_url": authorization_url
                }
            )
            return CrewOutput(response=response, frontend_state="booking_confirmation").model_dump_json()

        except Exception as e:
            error_response = Response(
                chat_response=f"An error occurred while re: {str(e)}",
                tool_response={"error": str(e), "status": "error"}
            )
            return CrewOutput(response=error_response, frontend_state="error").model_dump_json()
