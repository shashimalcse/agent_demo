import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export type Preferences = {
  checkIn: Date
  checkOut: Date
  location: string
}

export function PreferencesWidget({ onSubmit }: { onSubmit: (preferences: Preferences) => void }) {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [location, setLocation] = useState("")

  const handleSubmit = () => {
    if (checkIn && checkOut && location) {
      onSubmit({ checkIn, checkOut, location })
    }
  }

  return (
    <Card className="p-4 mt-4 space-y-4">
      <div className="space-y-2">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
              <SelectItem value="Gardeo Saman Villa">Gardeo Saman Villa</SelectItem>
              <SelectItem value="Gardeo Colombo Seven">Gardeo Colombo Seven</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(!checkIn && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? checkIn.toLocaleDateString() : "Check-in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(!checkOut && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? checkOut.toLocaleDateString() : "Check-out"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      <Button 
        className="w-full bg-orange-500" 
        onClick={handleSubmit}
        disabled={!checkIn || !checkOut || !location}
      >
        Check Rates
      </Button>
    </Card>
  )
}
