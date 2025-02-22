from fastapi import FastAPI, HTTPException
from typing import List, Optional
from datetime import date
from .schemas import *

app = FastAPI()

# In-memory data stores
hotels_data = {
    1: {"name": "Grand Hotel", "location": "Galle", "rating": 4.5},
    2: {"name": "Beach Resort", "location": "Arugambe", "rating": 4.8}
}

rooms_data = {
    1: {  # Hotel 1 rooms
        101: {"room_number": "101", "room_type": "single", "price_per_night": 99.99},
        102: {"room_number": "102", "room_type": "double", "price_per_night": 149.50}
    },
    2: {  # Hotel 2 rooms
        201: {"room_number": "201", "room_type": "suite", "price_per_night": 299.99},
        202: {"room_number": "202", "room_type": "double", "price_per_night": 199.50}
    }
}

bookings_data = {}
last_booking_id = 0

@app.get("/hotels/", response_model=List[Hotel])
def list_hotels():
    return [
        Hotel(id=hid, **hotel_data)
        for hid, hotel_data in hotels_data.items()
    ]

@app.get("/rooms/search", response_model=List[RoomSearchResult])
def search_rooms(
    check_in: date,
    check_out: date,
    location: str,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    room_type: Optional[str] = None
):
    search_results = []
    
    for hotel_id, hotel in hotels_data.items():
        # Filter by location if specified
        if location and location.lower() not in hotel["location"].lower():
            continue
            
        hotel_rooms = rooms_data.get(hotel_id, {})
        for rid, room in hotel_rooms.items():
            # Filter by room type if specified
            if room_type and room_type.lower() != room["room_type"].lower():
                continue
                
            # Filter by price range
            if min_price is not None and room["price_per_night"] < min_price:
                continue
            if max_price is not None and room["price_per_night"] > max_price:
                continue
            
            # Check availability for the given dates
            is_available = True
            for booking in bookings_data.values():
                if (booking["hotel_id"] == hotel_id and 
                    booking["room_id"] == rid and 
                    not (check_out <= booking["check_in"] or check_in >= booking["check_out"])):
                    is_available = False
                    break
            
            if is_available:
                search_results.append(
                    RoomSearchResult(
                        room_id=rid,
                        hotel_id=hotel_id,
                        hotel_name=hotel["name"],
                        hotel_location=hotel["location"],
                        hotel_rating=hotel["rating"],
                        room_number=room["room_number"],
                        room_type=room["room_type"],
                        price_per_night=room["price_per_night"]
                    )
                )
    
    return search_results

@app.post("/bookings", response_model=Booking)
def book_room(booking: BookingCreate):
    global last_booking_id
    
    # Validate hotel exists
    if booking.hotel_id not in hotels_data:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    # Validate room exists
    if booking.room_id not in rooms_data.get(booking.hotel_id, {}):
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if room is available for the dates
    for existing_booking in bookings_data.values():
        if (existing_booking["hotel_id"] == booking.hotel_id and 
            existing_booking["room_id"] == booking.room_id and 
            not (booking.check_out <= existing_booking["check_in"] or 
                 booking.check_in >= existing_booking["check_out"])):
            raise HTTPException(status_code=400, detail="Room not available for these dates")
    
    # Calculate total price
    room = rooms_data[booking.hotel_id][booking.room_id]
    days = (booking.check_out - booking.check_in).days
    total_price = room["price_per_night"] * days
    
    # Create booking
    last_booking_id += 1
    bookings_data[last_booking_id] = {
        "hotel_id": booking.hotel_id,
        "user_id": booking.user_id,
        "room_id": booking.room_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "total_price": total_price
    }
    
    return Booking(id=last_booking_id, **bookings_data[last_booking_id])

@app.get("/users/{user_id}/bookings", response_model=List[Booking])
def get_user_bookings(user_id: int):
    return [
        Booking(id=bid, **booking)
        for bid, booking in bookings_data.items()
        if booking["user_id"] == user_id
    ]

@app.get("/users/{user_id}/loyalty", response_model=UserLoyalty)
def get_user_loyalty(user_id: int):
    # Return mock loyalty data
    return {"user_id": user_id, "loyalty_points": 1200}
