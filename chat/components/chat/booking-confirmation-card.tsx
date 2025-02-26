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
  authorizationUrl: string
  onContinueBooking: () => void;
}

export function BookingConfirmationCard({ authorizationUrl, onContinueBooking }: BookingConfirmationCardProps) {
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
