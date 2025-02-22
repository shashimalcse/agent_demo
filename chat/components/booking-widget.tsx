"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function BookingWidget() {
  const [checkInDate, setCheckInDate] = React.useState<Date>()
  const [checkOutDate, setCheckOutDate] = React.useState<Date>()

  return (
    <div className="container">
      <div className="mx-auto max-w-4xl rounded-xl bg-white/10 backdrop-blur-md backdrop-saturate-150 border border-white/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:bg-black/10">
        <div className="grid gap-4 md:grid-cols-4">
          <Select>
            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/20">
              <SelectValue placeholder="Select Hotel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Galle">Galle</SelectItem>
              <SelectItem value="Arugambe">Arugambe</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border-white/20",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? checkInDate.toLocaleDateString() : "Check-in"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/50 backdrop-blur-sm border-white/20",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? checkOutDate.toLocaleDateString() : "Check-out"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button className="bg-primary/90 text-primary-foreground hover:bg-primary/80 backdrop-blur-sm bg-orange-500">
            Check Rates
          </Button>
        </div>
      </div>
    </div>
  )
}

