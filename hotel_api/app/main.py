from fastapi import FastAPI
from typing import List, Optional
from .schemas import *

app = FastAPI()

# In-memory dictionary for rooms
rooms_data = {
    1: {"room_number": "101", "room_type": "single", "price_per_night": 99.99, "is_available": True},
    2: {"room_number": "102", "room_type": "double", "price_per_night": 149.50, "is_available": True}
}

# In-memory dictionary for bookings
bookings_data = {}
last_booking_id = 0

@app.get("/rooms/", response_model=List[Room])
def list_rooms(
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    mock_rooms = []
    for rid, r in rooms_data.items():
        if min_price is not None and r["price_per_night"] < min_price:
            continue
        if max_price is not None and r["price_per_night"] > max_price:
            continue
        mock_rooms.append(
            Room(
                id=rid,
                room_number=r["room_number"],
                room_type=r["room_type"],
                price_per_night=r["price_per_night"],
                is_available=r["is_available"]
            )
        )
    return mock_rooms

@app.post("/bookings/", response_model=Booking)
def book_room(booking: BookingCreate):
    global last_booking_id
    global bookings_data
    
    last_booking_id += 1
    total_price = 120.00  # For demonstration
    bookings_data[last_booking_id] = {
        "user_id": booking.user_id,
        "room_id": booking.room_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "total_price": total_price
    }
    return Booking(
        id=last_booking_id,
        user_id=booking.user_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        total_price=total_price
    )

@app.get("/users/{user_id}/bookings", response_model=List[Booking])
def get_user_bookings(user_id: int):
    # Return a list of in-memory bookings matching user_id
    user_bookings = []
    for bid, b in bookings_data.items():
        if b["user_id"] == user_id:
            user_bookings.append(
                Booking(
                    id=bid,
                    user_id=b["user_id"],
                    room_id=b["room_id"],
                    check_in=b["check_in"],
                    check_out=b["check_out"],
                    total_price=b["total_price"]
                )
            )
    return user_bookings

@app.get("/users/{user_id}/loyalty", response_model=UserLoyalty)
def get_user_loyalty(user_id: int):
    # Return mock loyalty data
    return {"user_id": user_id, "loyalty_points": 1200}

@app.post("/chat/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Run the agent with user's message
        result = hotel_agent.crew().kickoff(inputs={'preferences': request.message})
        # Extract the response from result (adjust based on actual agent output structure)
        response = str(result)  # Convert result to string or extract relevant part
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
