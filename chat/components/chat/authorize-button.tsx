import { Button } from "@/components/ui/button"
import { Lock, ArrowRight } from "lucide-react"
import { Room } from "./room-list"
import { useState } from "react"

interface AuthorizeButtonProps {
  selectedRoom: Room  
  authorizationUrl: string
  onContinueBooking: () => void
}

export function AuthorizeButton({ authorizationUrl, onContinueBooking }: AuthorizeButtonProps) {
  const [hasClicked, setHasClicked] = useState(false)

  const handleAuthorize = () => {
    window.open(authorizationUrl, '_blank', 'noopener,noreferrer')
    setHasClicked(true)
  }

  if (hasClicked) {
    return (
      <Button 
        onClick={onContinueBooking}
        className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
      >
        <ArrowRight className="mr-2 h-4 w-4" />
        Continue Booking
      </Button>
    )
  }

  return (
    <Button 
      onClick={handleAuthorize}
      className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
    >
      <Lock className="mr-2 h-4 w-4" />
      Authorize Booking
    </Button>
  )
}
