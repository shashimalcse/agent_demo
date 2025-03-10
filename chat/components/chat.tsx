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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Hotel } from "lucide-react"
import { Info, Key, CheckCircle, Calendar, ArrowRight } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

// Define scenario type
interface Scenario {
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  state?: string;
  matchStates?: string[];
  priority?: number;
}

// ScenarioCard component for displaying scenario information
function ScenarioCard({ scenario }: { scenario: Scenario }) {
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-gray-50 p-2 flex-shrink-0">
            {scenario.icon}
          </div>
          
          <div>
            <h3 className="font-semibold text-sm text-gray-900">{scenario.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{scenario.description}</p>
          
          </div>
        </div>
        
        {(
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="text-xs text-gray-600 whitespace-pre-line">
              {scenario.details}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StateInfoButton({ threadId }: { threadId: string }) {
  // Define scenarios with priority
  const scenarios: Scenario[] = [
    {
      title: "Adding Booking to Calendar",
      description:
        "The agent offers to add reservation details to Google Calendar after booking is confirmed.",
      details:
        "1. The agent generates a Google authorization URL for the user.\n" +
        "2. The user is redirected to the Identity Server for Google authorization.\n" +
        "3. The user authenticates with their Google credentials and grants calendar access permissions.\n" +
        "4. The Identity Server obtains a Google OAuth token and issues it to the agent.\n" +
        "5. The agent uses this Google delegation token to invoke Google Calendar APIs.\n" +
        "6. The booking details are successfully added to the user's Google Calendar.\n" +
        "7. The agent confirms successful calendar integration to the user.",
      icon: <Calendar className="w-6 h-6 text-red-600" />,
      state: "CALENDAR_STATE",
      matchStates: ["ADDED_TO_CALENDAR"],
      priority: 1 // Highest priority
    },
    {
      title: "User Authorization for Booking",
      description:
        "The user confirms their booking. The agent completes the booking using a user delegation token.",
      details:
        "1. The agent generates an authorization URL for the user.\n" +
        "2. The user is redirected to the Identity Server for authorization.\n" +
        "3. The user authenticates and grants permission for the booking action.\n" +
        "4. The Identity Server issues a token to the agent on behalf of the user (user delegation token).\n" +
        "5. The agent invokes the Hotel API to complete the booking using this delegation token.\n" +
        "6. The booking is confirmed and details are returned to the user.",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      state: "BOOKING_STATE",
      matchStates: ["BOOKING_COMPLETED"],
      priority: 2 // Second priority
    },
    {
      title: "Hotel Suggestions",
      description:
        "The agent retrieves available rooms and presents options to the user. The user then selects a preferred room.",
      details:
        "1. The agent requests an access token from the Identity Server using its own credentials.\n" +
        "2. The agent receives an agent token with appropriate scopes.\n" +
        "3. The agent uses this token to invoke Hotel APIs for room availability and pricing.\n" +
        "4. The agent presents room options to the user.\n" +
        "5. The user selects a room from the available options.",
      icon: <Key className="w-6 h-6 text-blue-600" />,
      state: "FETCH_HOTELS_STATE",
      matchStates: ["FETCHED_HOTELS", "FETCHED_HOTEL", "FETCHED_ROOM"],
      priority: 3 // Lowest priority
    }
  ];
  
  // Define types for state information
  type StateInfo = {
    state?: string;
    [key: string]: unknown;
  };
  
  const [stateInfo, setStateInfo] = useState<StateInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioToShow, setScenarioToShow] = useState<Scenario | null>(null);
  const [hasCheckedScenario, setHasCheckedScenario] = useState(false);
  const [showStateButton, setShowStateButton] = useState(false);

  // Pre-fetch the state information when component mounts
  useEffect(() => {
    const checkForState = async () => {
      try {
        // Always show the button initially, we'll hide it if no state is found
        setShowStateButton(true);
        
        const response = await fetch(`http://localhost:8000/state/${threadId}`);
        
        if (!response.ok) {
          console.error(`Error fetching state: ${response.status}`);
          setShowStateButton(false);
          return;
        }
        
        const data = await response.json();
        
        // Only keep the button shown if we got valid state data
        if (data && data.state) {
          setStateInfo(data);
        } else {
          setShowStateButton(false);
        }
      } catch (err) {
        console.error("Error checking for state:", err);
        setShowStateButton(false);
      }
    };
    
    checkForState();
  }, [threadId]);

  // Helper function to find the appropriate scenario based on state with priority
  const findScenarioForState = (stateInfo: StateInfo): Scenario | null => {
    // If state is empty or undefined, return null (no scenario)
    if (!stateInfo.states) return null;
    
    // Get the current state
    const currentState = stateInfo.states as string[]
    
    // First sort scenarios by priority
    const sortedScenarios = [...scenarios].sort((a, b) => 
      (a.priority || 999) - (b.priority || 999)
    );
    
    // Check each scenario in priority order to see if its matchStates includes the current state
    for (const scenario of sortedScenarios) {
      // Skip scenarios without matchStates
      if (!scenario.matchStates || scenario.matchStates.length === 0) continue;
      
      // Check if ANY of the matchStates appear in the current state
      // We only need ONE match for the scenario to be valid
      const hasMatch = scenario.matchStates.some(matchState => 
        currentState.includes(matchState)
      );
      
      if (hasMatch) {
        return scenario;
      }
    }
    
    // If no matching scenario is found
    return null;
  };
  
  const fetchStateInfo = async () => {
    // If we've already determined a scenario, don't fetch again
    if (hasCheckedScenario) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // If we already have state info from the pre-fetch, use it
      console.log("stateInfo", stateInfo);
      if (stateInfo) {
        const matchedScenario = findScenarioForState(stateInfo);
        setScenarioToShow(matchedScenario);
        setHasCheckedScenario(true);
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch it from the API
      const response = await fetch(`http://localhost:8000/state/${threadId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching state: ${response.status}`);
      }
      
      const data = await response.json();
      setStateInfo(data);
      
      // Find the appropriate scenario for the fetched state
      const matchedScenario = findScenarioForState(data);
      setScenarioToShow(matchedScenario);
      setHasCheckedScenario(true);
      
    } catch (err) {
      console.error("Error fetching state info:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch state information");
    } finally {
      setIsLoading(false);
    }
  };

  // If the button shouldn't be shown, don't render anything
  // if (!showStateButton) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          onClick={fetchStateInfo}
          className="flex items-center text-gray-400 hover:text-orange-500 transition-colors text-xs mt-2"
        >
          <Info className="h-3.5 w-3.5 mr-1" />
          <span>Info</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 shadow-md border border-gray-200 rounded-lg" align="end">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full mr-2"></div>
            <p className="text-sm text-gray-500">Loading state information...</p>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 py-4 flex items-center justify-center">
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Error Loading State</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}
        
        {!isLoading && !error && scenarioToShow && (
          <ScenarioCard scenario={scenarioToShow} />
        )}
        
        {!isLoading && !error && hasCheckedScenario && !scenarioToShow && (
          <div className="text-sm text-gray-500 py-6 text-center">
            {stateInfo?.state ? (
              <>
                <p>No relevant scenario found for the current state</p>
                <p className="text-xs mt-2 bg-gray-50 p-2 rounded">Current state: {stateInfo.state}</p>
              </>
            ) : (
              <p>No state information available</p>
            )}
          </div>
        )}
        
        {!isLoading && !error && !hasCheckedScenario && (
          <div className="text-sm text-gray-500 py-6 text-center">
            <p>Click to load state information</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ChatComponent() {
  const { data: session } = useSession()
  const [threadId, setThreadId] = useState<string>(Date.now().toString())
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      content: `Hello ${session?.user?.username || 'there'} ! How can I help you today?`,
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
    <div className="flex flex-col h-full w-full bg-gray-50">
      <SheetHeader className="flex flex-row items-center justify-center gap-3 px-4 py-3 border-b font-sans font-semibold shadow-sm bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
            <Hotel className="h-4 w-4 text-white" />
          </div>
          <span>Gardeo Hotel Agent</span>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "flex-row-reverse" : ""} gap-3 items-end`}
            >
              {!msg.isUser && (
                <Avatar className="w-7 h-7 border border-orange-200 bg-orange-100">
                  <AvatarFallback className="bg-orange-500 text-white text-xs">GA</AvatarFallback>
                </Avatar>
              )}
              <div 
                className={`${
                  msg.isUser 
                    ? "rounded-l-xl rounded-tr-xl bg-orange-500 text-white" 
                    : "rounded-r-xl rounded-tl-xl bg-white border border-gray-200"
                } p-3 max-w-[80%]`}
              >
                {msg.isLoading ? (
                  <LoadingIndicator action={msg.loadingAction} />
                ) : (
                  <>
                    {msg.isUser ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <div className="text-sm text-gray-800">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}
                    {!msg.isUser && msg.toolResponse && renderToolResponse(msg.toolResponse)}
                  </>
                )}
                
                {!msg.isUser && !msg.isLoading && msg.toolResponse && (
                  <div className="flex justify-end mt-1">
                    <StateInfoButton 
                      threadId={threadId}
                    />
                  </div>
                )}
              </div>
              {msg.isUser && (
                <Avatar className="w-7 h-7 border border-orange-200">
                  <AvatarFallback className="bg-gray-100 text-orange-500 text-xs">
                    {session?.user?.name?.substring(0, 2)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t mt-auto bg-white">
        <div className="flex flex-col w-full gap-2 items-center max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 border-gray-300 focus-visible:ring-orange-500 rounded-md h-10"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading} 
              className="rounded-full shrink-0 bg-orange-500 hover:bg-orange-600 h-10 w-10 shadow-none"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <div>
            <p className="text-[10px] text-gray-500 text-center">
              Agent can make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

