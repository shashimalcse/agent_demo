"use client"
import { useState, FormEvent, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PreferencesWidget, type Preferences } from "./chat/preferences-widget"
import { Room, RoomList } from "./chat/room-list"
import { useSession } from "next-auth/react"
import { AuthorizeButton } from "./chat/authorize-button"
import { LoadingIndicator } from "./chat/loading-indicator"
import { BookingConfirmationCard } from "./chat/booking-confirmation-card"
import { MarkdownRenderer } from "./chat/markdown-renderer"

type SelectedRoom = {
  hotel_id: string
  room_id: string
  check_in: string
  check_out: string
}

type RoomDetails = {
  room_id?: number
  room_number?: string
  room_type?: string
  room_type_description?: string
  price_per_night?: number
  total_price?: number
  hotel_id?: number
  hotel_name?: string
  hotel_description?: string
  hotel_rating?: number
  is_available?: boolean
  check_in?: string
  check_out?: string
}

type Response = {
  chat_response: string
  tool_response: {
    rooms?: Room[]
    check_in?: string
    check_out?: string
    selected_room?: SelectedRoom
    authorization_url?: string
    room_details?: RoomDetails
  }
}

type AgentMessage = {
  id: string
  response: Response
  frontend_state: string
}

type Message = {
  id: string
  content: string
  isUser: boolean
  isLoading?: boolean
  loadingAction?: 'searching' | 'booking' | 'default'
  toolResponse?: AgentMessage
}

export function ChatComponent() {
  const { data: session } = useSession()
  const [threadId, setThreadId] = useState<string>(Date.now().toString())
  const [messages, setMessages] = useState<Message[]>([
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
    }

    const loadingMessage: Message = {
      id: 'loading',
      content: '',
      isUser: false,
      isLoading: true,
      loadingAction: 'default'
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`,
          "ThreadId": threadId
        },
        body: JSON.stringify({
          message: input,
          threadId: threadId
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const agentMessage = await response.json() as AgentMessage

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentMessage.response.chat_response,
        isUser: false,
        toolResponse: agentMessage
      }

      setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
        id: Date.now().toString(),
        content: "Sorry, I couldn't process your message. Please try again.",
        isUser: false
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesSubmit = async (preferences: Preferences) => {
    const message = `Searching for rooms in ${preferences.location} from ${preferences.checkIn.toLocaleDateString()} to ${preferences.checkOut.toLocaleDateString()}`

    const loadingMessage: Message = {
      id: 'loading',
      content: '',
      isUser: false,
      isLoading: true,
      loadingAction: 'searching'
    }

    setMessages((prev) => [...prev, loadingMessage])
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30`
        },
        body: JSON.stringify({
          message: message,
        })
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const agentMessage = await response.json() as AgentMessage

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentMessage.response.chat_response,
        isUser: false,
        toolResponse: agentMessage
      }

      setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
    } catch (error) {
      console.error("Error sending preferences:", error)
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
        id: Date.now().toString(),
        content: "Sorry, I couldn't process your preferences. Please try again.",
        isUser: false
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookConfirmation = async (room: Room, checkIn: string, checkOut:string) => {
    const bookingMessage = `I would like this room id : ${room.room_number} at hotel id : ${room.hotel_id} from ${checkIn} to ${checkOut}. Please give me booking details before proceeding.`;
  
    
    const loadingMessage: Message = {
      id: 'loading',
      content: '',
      isUser: false,
      isLoading: true,
      loadingAction: 'booking'
    }
  
    setMessages((prev) => [...prev, loadingMessage])
    setIsLoading(true)
  
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`,
          "ThreadId": threadId
        },
        body: JSON.stringify({
          message: bookingMessage,
          threadId: threadId
        })
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const agentMessage = await response.json() as AgentMessage
  
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentMessage.response.chat_response,
        isUser: false,
        toolResponse: agentMessage
      }
  
      setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
    } catch (error) {
      console.error("Error booking room:", error)
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
        id: Date.now().toString(),
        content: "Sorry, I couldn't process your booking request. Please try again.",
        isUser: false
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookConfirmationRetry = async (room: RoomDetails) => {
    const bookingMessage = `Ok i am ok with booking details you provide. Lets book the room id : ${room.room_id} at hotel id : ${room.hotel_id} from ${room.check_in} to ${room.check_out}.`;
    
    const loadingMessage: Message = {
      id: 'loading',
      content: '',
      isUser: false,
      isLoading: true,
      loadingAction: 'booking'
    }
  
    setMessages((prev) => [...prev, loadingMessage])
    setIsLoading(true)
  
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken}`,
          "ThreadId": threadId
        },
        body: JSON.stringify({
          message: bookingMessage,
          threadId: threadId
        })
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const agentMessage = await response.json() as AgentMessage
  
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentMessage.response.chat_response,
        isUser: false,
        toolResponse: agentMessage
      }
  
      setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))
    } catch (error) {
      console.error("Error booking room:", error)
      setMessages(prev => prev.filter(msg => msg.id !== 'loading').concat({
        id: Date.now().toString(),
        content: "Sorry, I couldn't process your booking request. Please try again.",
        isUser: false
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const renderToolResponse = (msg: AgentMessage) => {
    if (msg.frontend_state === "get_preferences") {
      return <PreferencesWidget onSubmit={handlePreferencesSubmit} />
    } else if (msg.frontend_state === "show_rooms" && msg.response.tool_response?.rooms) {
      return (
        <RoomList 
          rooms={msg.response.tool_response.rooms} 
          checkIn={msg.response.tool_response.check_in}
          checkOut={msg.response.tool_response.check_out}
          onBookConfirmation={handleBookConfirmation}
        />
      )
    } else if (msg.frontend_state === "booking_confirmation") {
      const { tool_response } = msg.response;
      if (tool_response.room_details && 'room_id' in tool_response.room_details) {
        return (
          <BookingConfirmationCard 
            bookingDetails={tool_response.room_details} 
            authorizationUrl={tool_response.authorization_url} 
            onContinueBooking={() => {
              if (tool_response.room_details) {
                handleBookConfirmationRetry(
                  tool_response.room_details
                )
              }
            }}
          />
        )
      }
    } 
    
    // else if (msg.frontend_state === "unauthorize" && msg.response.tool_response?.authorization_url) {
    //   const { selected_room, authorization_url, check_in, check_out } = msg.response.tool_response
    //   return (
    //     <AuthorizeButton 
    //       authorizationUrl={authorization_url} 
    //       onContinueBooking={() => {
    //         if (selected_room) {
    //           handleBookConfirmationRetry(
    //             selected_room,
    //             check_in,
    //             check_out
    //           )
    //         }
    //       }}
    //     />
    //   )
    // }
    return null
  }

  return (
    <Card className="flex h-full w-full flex-col rounded-none border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-4 md:px-6">
        <div className="flex items-center gap-4">
          <div>
            <h4 className="font-semibold">Hotel Support</h4>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-auto px-4 md:px-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "flex-row-reverse" : ""} gap-3`}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{msg.isUser ? "U" : "HS"}</AvatarFallback>
            </Avatar>
            <div className={`rounded-lg ${msg.isUser ? "bg-orange-500" : "bg-muted"} p-3 max-w-[80%]`}>
              {msg.isLoading ? (
                <LoadingIndicator action={msg.loadingAction} />
              ) : (
                <>
                  {msg.isUser ? (
                    <p className="text-sm text-primary-foreground">{msg.content}</p>
                  ) : (
                    <div className="text-sm">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  )}
                  {!msg.isUser && msg.toolResponse && renderToolResponse(msg.toolResponse)}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="px-4 md:px-6">
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading} className="bg-orange-500">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

