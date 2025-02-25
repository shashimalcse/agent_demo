from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import date
from .schemas import *
from .dependencies import TokenData, validate_token
from .constants import SCOPES

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data stores
hotels_data = {
    1: {"name": "Asgardeo Saman Villa", "description": "Enjoy a luxurious stay at Asgardeo Saman Villas in your suite, and indulge in a delicious breakfast and your choice of lunch or dinner from our daily set menus served at the restaurant. Access exquisite facilities, including the infinity pool, Sahana Spa, gymnasium and library, as you unwind in paradise.", "rating" : 4.5},
    2: {"name": "Asgardeo Colombo Seven", "description": "Asgardeo Colombo Seven is located in the heart of Colombo, the commercial capital of Sri Lanka and offers the discerning traveler contemporary accommodation and modern design aesthetic. Rising over the city landscape, the property boasts stunning views, a rooftop bar and pool, main restaurant, gym and spa services, as well as conference facilities.", "rating" : 4.9}
}

room_type_data = {
    "deluxe": {"description": "The spacious rooms are defined by king size beds commanding a modern yet minimal ambience, with amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveler needs."},
    "super_deluxe": {"description": "The super deluxe rooms are defined by king size beds commanding a modern yet minimal ambience, with a bathtub and amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveler needs."},
    "studio": {"description": "The 1 bedroom serviced apartments spacious living areas as well as a kitchen housing a cooker, fridge, washing machine and microwave. Rooms are defined by king size beds commanding a modern yet minimal ambience, with amenities set in minimalist contours of elegance and efficiency with all the creature comforts a traveller needs."}
}

rooms_data = {
    1: { 
        101: {"room_number": "101", "room_type": "deluxe", "price_per_night": 99.99},
        102: {"room_number": "102", "room_type": "super_deluxe", "price_per_night": 149.50}
    },
    2: {
        201: {"room_number": "201", "room_type": "studio", "price_per_night": 299.99},
        202: {"room_number": "202", "room_type": "super_deluxe", "price_per_night": 199.50}
    }
}

bookings_data = {}
last_booking_id = 0

@app.get("/hotels", response_model=List[Hotel])
async def list_hotels(
    token_data: TokenData = Security(validate_token, scopes=["read_hotels"])
):
    return [
        Hotel(id=hid, **hotel_data)
        for hid, hotel_data in hotels_data.items()
    ]

@app.get("/rooms/search", response_model=List[RoomSearchResult])
async def search_rooms(
    check_in: date,
    check_out: date,
    name: str,
    token_data: TokenData = Security(validate_token, scopes=["read_rooms"])
):
    search_results = []
    
    for hotel_id, hotel in hotels_data.items():
        # Filter by location if specified
        if name and name.lower() not in hotel["name"].lower():
            continue
            
        hotel_rooms = rooms_data.get(hotel_id, {})
        for rid, room in hotel_rooms.items():
            
            # Check availability for the given dates
            is_available = True
            for booking in bookings_data.values():
                if (booking["hotel_id"] == hotel_id and 
                    booking["room_id"] == rid and 
                    not (check_out <= booking["check_in"] or check_in >= booking["check_out"])):
                    is_available = False
                    break
            
            if is_available:
                # Get room type description
                room_type_description = room_type_data[room["room_type"]]["description"]
                
                search_results.append(
                    RoomSearchResult(
                        room_id=rid,
                        hotel_id=hotel_id,
                        hotel_name=hotel["name"],
                        hotel_rating=hotel["rating"],
                        hotel_description=hotel["description"],
                        room_number=room["room_number"],
                        room_type=room["room_type"],
                        room_type_description=room_type_description,
                        price_per_night=room["price_per_night"]
                    )
                )
    
    return search_results

@app.post("/bookings", response_model=Booking)
async def book_room(
    booking: BookingCreate,
    token_data: TokenData = Security(validate_token, scopes=["create_bookings"])
):
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
    
    # Get hotel and room data
    hotel = hotels_data[booking.hotel_id]
    room = rooms_data[booking.hotel_id][booking.room_id]
    
    # Calculate total price
    days = (booking.check_out - booking.check_in).days
    total_price = room["price_per_night"] * days
    
    # Create booking
    last_booking_id += 1
    bookings_data[last_booking_id] = {
        "hotel_id": booking.hotel_id,
        "hotel_name": hotel["name"],
        "user_id": booking.user_id,
        "room_id": booking.room_id,
        "room_type": room["room_type"],
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "total_price": total_price
    }
    
    return Booking(id=last_booking_id, **bookings_data[last_booking_id])

@app.get("/users/{user_id}/bookings", response_model=List[Booking])
async def get_user_bookings(
    user_id: str,
    token_data: TokenData = Security(validate_token, scopes=["read_bookings"])
):
    return [
        Booking(id=bid, **booking)
        for bid, booking in bookings_data.items()
        if booking["user_id"] == user_id
    ]

@app.get("/users/{user_id}/loyalty", response_model=UserLoyalty)
async def get_user_loyalty(
    user_id: int,
    token_data: TokenData = Security(validate_token, scopes=["read_loyalty"])
):
    # Return mock loyalty data
    return {"user_id": user_id, "loyalty_points": 1200}

@app.get("/rooms/{room_id}/details", response_model=RoomDetails)
async def get_room_details(
    room_id: int,
    check_in: date,
    check_out: date,
    token_data: TokenData = Security(validate_token, scopes=["read_rooms"])
):
    # Find the hotel that has this room
    hotel_id = None
    room_data = None
    for hid, rooms in rooms_data.items():
        if room_id in rooms:
            hotel_id = hid
            room_data = rooms[room_id]
            break
    
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check room availability
    is_available = True
    for booking in bookings_data.values():
        if (booking["hotel_id"] == hotel_id and 
            booking["room_id"] == room_id and 
            not (check_out <= booking["check_in"] or check_in >= booking["check_out"])):
            is_available = False
            break
    
    # Calculate total price
    days = (check_out - check_in).days
    total_price = room_data["price_per_night"] * days
    
    # Get hotel and room type details
    hotel = hotels_data[hotel_id]
    room_type_details = room_type_data[room_data["room_type"]]
    
    return {
        "room_id": room_id,
        "room_number": room_data["room_number"],
        "room_type": room_data["room_type"],
        "room_type_description": room_type_details["description"],
        "price_per_night": room_data["price_per_night"],
        "total_price": total_price,
        "hotel_id": hotel_id,
        "hotel_name": hotel["name"],
        "hotel_description": hotel["description"],
        "hotel_rating": hotel["rating"],
        "is_available": is_available,
        "check_in": check_in,
        "check_out": check_out
    }
