import { Button } from "@/components/ui/button";
import { CircleCheckBig } from "lucide-react";
import { useState } from "react";

interface BookingConfirmationCardProps {
  authorizationUrl: string
  onContinueBooking: () => void;
  threadId: string;
}

export function BookingConfirmationCard({ authorizationUrl, onContinueBooking, threadId }: BookingConfirmationCardProps) {
  const [hasClicked, setHasClicked] = useState(false)
  const handleAuthorize = () => {
    window.open(authorizationUrl, '_blank', 'noopener,noreferrer')
    setHasClicked(true)

    let attempts = 0;
    const maxAttempts = 12; // 12 attempts for 1 minute (5 seconds interval)
    const intervalId = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(intervalId);
        console.error('Authorization check timed out');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/state/${threadId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          const states = data.states;

          if (states.includes('BOOKING_AUTORIZED')) {
            clearInterval(intervalId);
            onContinueBooking();
          }
        } else {
          console.error('Failed to complete authorization');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }, 5000); // Call every 5 seconds
  }
  return (
    <div className="w-full mt-4">
      {
        !hasClicked ? (
          <Button
            onClick={handleAuthorize}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
          >
            Confirm Booking
          </Button>
        ) : (
          <div></div>
        )
      }
    </div>
  );
}
