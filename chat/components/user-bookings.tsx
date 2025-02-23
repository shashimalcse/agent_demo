import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";

type Booking =  {
    id: number;
    checkIn: string;
    checkOut: string;
    roomType: string;
    guests: number;
    status: string;
    user_id: number;
  }

export default function UserBookings() {
    const { data: session } = useSession()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                if (!session?.user?.id) return;
                
                const response = await fetch(`http://localhost:8001/users/${session.user.id}/bookings`, {
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${session?.accessToken}`,
                    },
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }
                
                const data = await response.json();
                setBookings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
            }
        };

        fetchBookings();
    }, [session]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif">My Bookings</h2>
            {bookings.map((booking) => (
                <Card key={booking.id} className="border border-orange-500">
                    <CardHeader>
                        <CardTitle>Booking #{booking.id}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Check-in</span>
                                <span>{booking.checkIn}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Check-out</span>
                                <span>{booking.checkOut}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Room Type</span>
                                <span>{booking.roomType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Guests</span>
                                <span>{booking.guests}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-green-600">{booking.status}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
