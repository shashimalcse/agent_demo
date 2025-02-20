from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Room(BaseModel):
    id: int
    room_number: str
    room_type: str
    price_per_night: float
    is_available: bool

class BookingCreate(BaseModel):
    user_id: int
    room_id: int
    check_in: datetime
    check_out: datetime

class Booking(BookingCreate):
    id: int
    total_price: float

class UserLoyalty(BaseModel):
    user_id: int
    loyalty_points: int

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
