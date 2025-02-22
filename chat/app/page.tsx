import Image from "next/image"
import BookingWidget from "@/components/booking-widget"
import ChatButton from "@/components/chat-button"
import { NavigationMenu } from "@/components/navigation-menu"

export default async function Home() {

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <NavigationMenu />
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] w-full pt-16 md:pt-20">
        <Image
          src="/image.jpg"
          alt="Aerial view of Asgardeo"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-8 md:bottom-24 left-0 right-0 px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm md:text-base uppercase tracking-wider text-muted-foreground">Welcome to</h2>
              <h1 className="text-3xl md:text-4xl font-serif">Hotel Asgardeo</h1>
            </div>
            <h3 className="text-lg md:text-xl text-muted-foreground">Relaxed Luxury In Southern Coast</h3>
            <div className="space-y-4">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Where the gloriously aqua-hued waters of the Indian Ocean gently lap fine golden sandy shores of the
                Southern coast of Sri Lanka, is where you'll find a unique and undeniably romantic boutique hotel that
                pushes the boundaries of luxury.
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Enjoy a choice of gorgeously appointed rooms, spaciously elegant interiors, and sprawling gardens set
                against the backdrop of the ocean. Come discover escapism at its finest, delivered with attentive,
                personalised service and inimitable savoir faire.
              </p>
            </div>
            <div className="pt-4 md:pt-6">
              <p className="font-medium text-base md:text-lg">Farrel Blom</p>
              <p className="text-xs md:text-sm text-muted-foreground">Deputy General Manager - Hotel Asgardeo</p>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted h-full w-full">
            {/* Add an image here using Next.js Image component */}
          </div>
        </div>
      </section>

      {/* Chat Button */}
      <ChatButton />
    </div>
  )
}

