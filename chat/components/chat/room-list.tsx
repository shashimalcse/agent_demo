import { Card } from "@/components/ui/card"

type Room = {
  room_id: number
  hotel_name: string
  hotel_location: string
  hotel_rating: number
  room_number: string
  room_type: string
  price_per_night: number
}

export function RoomList({ rooms }: { rooms: Room[] }) {
  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card key={room.room_id} className="p-4 hover:bg-accent transition-colors cursor-pointer">
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
        </Card>
      ))}
    </div>
  )
}
