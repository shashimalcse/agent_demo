from datetime import date
from typing import Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
import requests

from schemas import CrewOutput, Response
from utils.asgardeo_manager import asgardeo_manager

class BookRoomsToolInput(BaseModel):
    """Input schema for BookRoomsTool."""
    hotel_id: int = Field(..., description="Hotel ID")
    room_id: int = Field(..., description="Room ID")
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")


class BookRoomsTool(BaseTool):
    name: str = "BookRoomsTool"
    description: str = "Books a hotel room for specified dates if available"
    args_schema: Type[BaseModel] = BookRoomsToolInput
    thread_id: Optional[str] = None

    def __init__(self, thread_id: str = None):
        super().__init__()
        self.thread_id = thread_id

    def _run(self, hotel_id: int, room_id: int, check_in: date, check_out: date) -> str:
        try:
            # Get access token
            user_id = asgardeo_manager.get_user_id_from_thread_id(self.thread_id)
            access_token = asgardeo_manager.get_user_token(user_id, ["openid", "createbookings"])
            if not access_token:
                response = Response(
                    chat_response="Please authenticate to book a room",
                    tool_response={
                        "selected_room": {
                            "hotel_id": hotel_id,
                            "room_id": room_id,
                            "check_in": check_in,
                            "check_out": check_out
                        },
                        "authorization_url": asgardeo_manager.get_authorization_url(user_id, ["openid", "createbookings"])
                    }
                )
                return CrewOutput(response=response, frontend_state="unauthorize").model_dump_json()

            # Prepare the booking request
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            booking_data = {
                "user_id": user_id,
                "hotel_id": hotel_id,
                "room_id": room_id,
                "check_in": check_in.isoformat(),
                "check_out": check_out.isoformat()
            }

            api_response = requests.post('http://localhost:8001/bookings', json=booking_data, headers=headers)
            
            if (api_response.status_code == 200):
                booking_details = api_response.json()
                response_dict = {
                    "booking_id": booking_details["id"],
                    "total_price": booking_details["total_price"],
                    "status": "confirmed"
                }
                message = f"Room successfully booked at hotel {hotel_id} for dates {check_in} to {check_out}"
            else:
                response_dict = {
                    "error": api_response.json().get("detail", "Booking failed"),
                    "status": "failed"
                }
                message = f"Failed to book room: {response_dict['error']}"

            response = Response(
                chat_response=message,
                tool_response=response_dict
            )
            return CrewOutput(response=response, frontend_state="booking_confirmation").model_dump_json()

        except Exception as e:
            error_response = Response(
                chat_response=f"An error occurred while booking the room: {str(e)}",
                tool_response={"error": str(e), "status": "error"}
            )
            return CrewOutput(response=error_response, frontend_state="error").model_dump_json()
