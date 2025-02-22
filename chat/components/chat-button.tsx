"use client"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChatComponent } from "@/components/chat"

export default function ChatButton() {
  return (
    <Sheet>
      <SheetTitle>Menu</SheetTitle>
      <SheetTrigger asChild>
        <Button size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-40 bg-orange-500">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" style={{ maxWidth: '30vw' }}>
        <div className="h-full w-full">
          <ChatComponent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

