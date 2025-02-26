from enum import Enum

class FrontendState(Enum):
    """Enum representing various states of the frontend."""
    UNAUTHORIZED = "unauthorized"
    GET_BOOKING_CONFIRMATION = "get_booking_confirmation"
    GET_BOOKING_CONFIRMATION_ERROR = "get_booking_confirmation_error"
    BOOKING_COMPLETED = "booking_completed"
    BOOKING_COMPLETED_ERROR = "booking_completed_error"
    NO_STATE = "no_state"

class FlowState(Enum):
    """Enum representing various states of the flow."""
    INITIAL_STATE = "INITIAL_STATE"
    FETCHED_HOTELS = "FETCHED_HOTELS"
    FETCHED_ROOMS = "FETCHED_ROOMS"
    SEARCHED_ROOMS = "SEARCHED_ROOMS"
    BOOKING_CONFIRMATION_INITIATED = "BOOKING_CONFIRMATION_INITIATED"
    BOOKING_CONFIRMATION_COMPLETED = "BOOKING_CONFIRMATION_COMPLETED"
    BOOKING_INITIATED = "BOOKING_INITIATED"
    BOOKING_COMPLETED = "BOOKING_COMPLETED"
    FETCHED_BOOKINGS = "FETCHED_BOOKINGS"
    ADDED_TO_CALENDAR = "ADDED_TO_CALENDAR"

