"use client"

import * as React from "react"
import { CalendarIcon, Users, BedDouble, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function BookingWidget() {
  const [checkInDate, setCheckInDate] = React.useState<Date>()
  const [checkOutDate, setCheckOutDate] = React.useState<Date>()
  const [adults, setAdults] = React.useState("2")
  const [rooms, setRooms] = React.useState("1")
  const [destination, setDestination] = React.useState<string | null>(null)
  const [property, setProperty] = React.useState<string | null>(null)

  // Properties by destination
  const propertiesByDestination: Record<string, {id: string, name: string}[]> = {
    "galle": [
      { id: "galle-fort", name: "Gardeo Galle Fort" },
      { id: "unawatuna", name: "Gardeo Unawatuna Beach" },
      { id: "koggala", name: "Gardeo Koggala Lake" }
    ],
    "kandy": [
      { id: "kandy-hills", name: "Gardeo Kandy Hills" },
      { id: "kandy-city", name: "Gardeo Kandy City" }
    ],
    "colombo": [
      { id: "colombo-city", name: "Gardeo Colombo City" },
      { id: "mount-lavinia", name: "Gardeo Mount Lavinia" }
    ],
    "arugambay": [
      { id: "arugambay-surf", name: "Gardeo Arugambay Surf" }
    ],
    "ella": [
      { id: "ella-rock", name: "Gardeo Ella Rock" }
    ],
  }

  // Reset property when destination changes
  React.useEffect(() => {
    setProperty(null)
  }, [destination])

  return (
    <div className="w-full px-4 py-6">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-serif font-medium text-gray-900 mb-1.5">Find Your Perfect Stay</h2>
        <p className="text-sm text-gray-600">Book directly for our best rate guarantee</p>
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Destination or Property</label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={destination || undefined} onValueChange={setDestination}>
              <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md">
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-orange-500" />
                  <SelectValue placeholder="Destination" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-destinations">All Destinations</SelectItem>
                <SelectItem value="galle">Galle</SelectItem>
                <SelectItem value="kandy">Kandy</SelectItem>
                <SelectItem value="colombo">Colombo</SelectItem>
                <SelectItem value="arugambay">Arugambay</SelectItem>
                <SelectItem value="ella">Ella</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={property || undefined} onValueChange={setProperty} disabled={!destination || destination === "all-destinations"}>
              <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md">
                <SelectValue placeholder="Select Hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any-property">Any Property</SelectItem>
                {destination && destination !== "all-destinations" && propertiesByDestination[destination]?.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Check-in Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md",
                  !checkInDate && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                {checkInDate ? checkInDate.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-gray-200" align="start">
              <Calendar 
                mode="single" 
                selected={checkInDate} 
                onSelect={setCheckInDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Check-out Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-white border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md",
                  !checkOutDate && "text-gray-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-orange-500" />
                {checkOutDate ? checkOutDate.toLocaleDateString() : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border border-gray-200" align="start">
              <Calendar 
                mode="single" 
                selected={checkOutDate} 
                onSelect={setCheckOutDate}
                initialFocus
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Guests & Rooms</label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={adults} onValueChange={setAdults}>
              <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md">
                <div className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-2 text-orange-500" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Adult</SelectItem>
                <SelectItem value="2">2 Adults</SelectItem>
                <SelectItem value="3">3 Adults</SelectItem>
                <SelectItem value="4">4 Adults</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={rooms} onValueChange={setRooms}>
              <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-orange-500 focus:border-orange-500 h-11 rounded-md">
                <div className="flex items-center">
                  <BedDouble className="w-3.5 h-3.5 mr-2 text-orange-500" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Room</SelectItem>
                <SelectItem value="2">2 Rooms</SelectItem>
                <SelectItem value="3">3 Rooms</SelectItem>
                <SelectItem value="4">4 Rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Find Rooms</label>
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11 rounded-md font-medium" type="submit">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
      
      {/* Member rate promotion */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center text-center">
        <div className="text-sm text-gray-600">
          <span className="text-orange-500 font-medium">Members save up to 15%</span> on our best available rates.{' '}
          <a href="#" className="text-orange-500 underline underline-offset-2">Sign in</a> or{' '}
          <a href="#" className="text-orange-500 underline underline-offset-2">Join Now</a>
        </div>
      </div>
    </div>
  )
}

