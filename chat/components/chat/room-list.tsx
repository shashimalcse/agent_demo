import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type Room = {
  room_id: number
  hotel_id: number
  hotel_name: string
  hotel_location: string
  hotel_rating: number
  room_number: string
  room_type: string
  price_per_night: number
}

type RoomListProps = {
  rooms: Room[]
  checkIn: string
  checkOut: string
  onBookRoom: (room: Room, checkIn: string, checkOut: string) => void
}

export function RoomList({ rooms, checkIn, checkOut, onBookRoom }: RoomListProps) {
  return (
    <div className="space-y-2 mt-4">
      {rooms.map((room) => (
        <Card key={room.room_id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{room.hotel_name}</h4>
              <p className="text-sm text-muted-foreground">{room.hotel_location}</p>
              <p className="text-sm">Room {room.room_number} - {room.room_type}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${room.price_per_night}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" onClick={() => {}}>
              View Details
            </Button>
            <Button 
              className="bg-orange-500" 
              onClick={() => onBookRoom(room, checkIn, checkOut)}
            >
              Book Now
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
