from enum import Enum

class FrontendState(Enum):
    """Enum representing various states of the frontend."""
    UNAUTHORIZED = "unauthorized"
    GET_BOOKING_CONFIRMATION = "get_booking_confirmation"
    GET_BOOKING_CONFIRMATION_ERROR = "get_booking_confirmation_error"
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_CONFIRMED_ERROR = "booking_confirmed_error"
    NO_STATE = "no_state"
