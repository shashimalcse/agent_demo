from pydantic import BaseModel
from datetime import date

class Hotel(BaseModel):
    id: int
    name: str
    location: str
    rating: float

class Room(BaseModel):
    id: int
    hotel_id: int
    room_number: str
    room_type: str
    price_per_night: float
    is_available: bool

class BookingCreate(BaseModel):
    user_id: str
    hotel_id: int
    room_id: int
    check_in: date
    check_out: date

class Booking(BaseModel):
    id: int
    user_id: str
    hotel_id: int
    room_id: int
    check_in: date
    check_out: date
    total_price: float

class UserLoyalty(BaseModel):
    user_id: str
    loyalty_points: int

class ChatRequest(BaseModel):
    message: str

class ChatResponseContent(BaseModel):
    chat_response: str
    tool_response: str

class ChatResponse(BaseModel):
    response: ChatResponseContent
    frontend_state: str = ""

class RoomSearchResult(BaseModel):
    room_id: int
    hotel_id: int
    hotel_name: str
    hotel_location: str
    hotel_rating: float
    room_number: str
    room_type: str
    price_per_night: float
