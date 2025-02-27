"use client"
import { useState, FormEvent, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Room } from "./chat/room-list"
import { useSession } from "next-auth/react"
import { LoadingIndicator } from "./chat/loading-indicator"
import { BookingConfirmationCard } from "./chat/booking-confirmation-card"
import { MarkdownRenderer } from "./chat/markdown-renderer"
import { AddToCalendar } from "./chat/add-to-calendar"
import { SheetHeader } from "./ui/sheet"
import { ScrollArea } from "./ui/scroll-area"
import { Send } from "lucide-react"

type SelectedRoom = {
  hotel_id: string
  room_id: string
  check_in: string
  check_out: string
}

type BookingPreview = {
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

type BookingDetails = {
  booking_id: string
}

type Response = {
  chat_response: string
  tool_response: {
    rooms?: Room[]
    check_in?: string
    check_out?: string
    selected_room?: SelectedRoom
    authorization_url?: string
    BookingDetails?: BookingPreview
    booking_details?: BookingDetails
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
  loadingAction?: 'searching' | 'booking' | 'default' | 'add_to_calendar'
  toolResponse?: AgentMessage
}

export function ChatComponent() {
  const { data: session } = useSession()
  const [threadId, setThreadId] = useState<string>(Date.now().toString())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      content: `Hello ${session?.user?.username} ! How can I help you today?`,
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showCalendarWidget, setShowCalendarWidget] = useState<boolean>(true)
  const [showPreviewConfirmWidget, setShowPreviewConfirmWidget] = useState<boolean>(true)

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

      setShowPreviewConfirmWidget(false)

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

  const handleAddToCalendar = async (bookingDetails: BookingDetails) => {
    // This function will be called when the user confirms adding to calendar
    try {
      const bookingMessage = `Lets add the booking with booking id : ${bookingDetails.booking_id} to the calendar.`;

      const loadingMessage: Message = {
        id: 'loading',
        content: '',
        isUser: false,
        isLoading: true,
        loadingAction: 'add_to_calendar'
      }

      setMessages((prev) => [...prev, loadingMessage])
      setIsLoading(true)

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
        throw new Error('Failed to add to calendar')
      }

      // Hide the calendar widget after successful addition
      setShowCalendarWidget(false)

      const agentMessage = await response.json() as AgentMessage

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentMessage.response.chat_response,
        isUser: false,
        toolResponse: agentMessage
      }

      setMessages((prev) => prev.filter(msg => msg.id !== 'loading').concat(botMessage))

    } catch (error) {
      console.error("Error adding to calendar:", error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: "Sorry, I couldn't add the event to your calendar. Please try again.",
        isUser: false
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipCalendar = () => {
    // Simply hide the calendar widget when skipped
    setShowCalendarWidget(false)
  }

  const renderToolResponse = (msg: AgentMessage) => {
    if (msg.frontend_state === "BOOKING_PREVIEW") {
      const { tool_response } = msg.response;
      if (tool_response?.authorization_url) {
        return (
          showPreviewConfirmWidget &&
          <BookingConfirmationCard
            threadId={threadId}
            authorizationUrl={tool_response.authorization_url}
            onContinueBooking={() => {
              if (tool_response.booking_preview) {
                handleBookConfirmationRetry(
                  tool_response.booking_preview
                )
              }
            }}
          />
        )
      }
    }
    if (msg.frontend_state === "BOOKING_COMPLETED") {
      const { tool_response } = msg.response;
      if (tool_response.authorization_url) {
        return (
          <div className="mt-2">
            {showCalendarWidget && (
              <AddToCalendar
                threadId={threadId}
                authorizationUrl={tool_response.authorization_url || ""}
                onAddToCalendar={() => {
                  if (tool_response.booking_details) {
                    handleAddToCalendar(tool_response.booking_details || {})
                  }
                }}
                onSkipCalendar={handleSkipCalendar}
              />
            )}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="flex flex-col h-full w-full">
      <SheetHeader className="flex flex-row items-center justify-center gap-3 px-4 py-3 border-b font-sans font-semibold">
        Gardeo Hotel Agent
      </SheetHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "flex-row-reverse" : ""} gap-3`}
            >
              <div className={`${msg.isUser ? "rounded-l-lg rounded-tr-lg bg-orange-500" : "rounded-r-lg rounded-tl-lg bg-slate-200"} p-2 max-w-[80%]`}>
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
        </div>
      </ScrollArea>

      <div className="p-3 border-t mt-auto">
        <div className="flex flex-col w-full gap-2 items-center">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading} className="rounded-full shrink-0 bg-orange-500 hover:bg-orange-600">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <div>
            <p className="text-[10px] text-gray-500">
              Agent can make mistakes. Check important info
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

