import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CircleCheckBig } from "lucide-react";
import { useState } from "react";

type BookingDetails = {
  room_id: number;
  room_number: string;
  room_type: string;
  price_per_night: number;
  total_price: number;
  hotel_id: number;
  hotel_name: string;
  check_in: string;
  check_out: string;
}

interface BookingConfirmationCardProps {
  bookingDetails: BookingDetails;
  authorizationUrl: string
  onContinueBooking: () => void;
}

export function BookingConfirmationCard({ bookingDetails, authorizationUrl, onContinueBooking }: BookingConfirmationCardProps) {
  const [hasClicked, setHasClicked] = useState(false)
  const handleAuthorize = () => {
    window.open(authorizationUrl, '_blank', 'noopener,noreferrer')
    setHasClicked(true)
  }
  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-serif">Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Hotel Information</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hotel Name</span>
              <span className="font-medium">{bookingDetails.hotel_name}</span>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Room Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Number</span>
                <span className="font-medium">{bookingDetails.room_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type</span>
                <span className="font-medium capitalize">{bookingDetails.room_type}</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Stay Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium">{new Date(bookingDetails.check_in).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium">{new Date(bookingDetails.check_out).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per night</span>
                <span className="font-medium">${bookingDetails.price_per_night}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Price</span>
                <span className="text-orange-600">${bookingDetails.total_price}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {
          hasClicked ? (
            <Button
              onClick={onContinueBooking}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Continue Booking
            </Button>
          ) : (<Button
            onClick={handleAuthorize}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
          >
            <CircleCheckBig className="mr-2 h-4 w-4" />
            Confirm Booking
          </Button>)
        }
      </CardFooter>
    </Card>
  );
}
