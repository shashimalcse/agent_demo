"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import { LogOut, Settings, User, ChevronDown, Hotel, Calendar, Coffee, Landmark, Phone, CreditCard } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect, ReactNode } from "react"

// Define types for the NavDropdown component
interface NavDropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  title: string;
  items: NavDropdownItem[];
  icon: ReactNode;
}

export function NavigationMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  return (
    <div className={`w-full transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="font-serif text-xl md:text-2xl">Gardeo</span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavDropdown 
            title="Our Hotels" 
            icon={<Landmark className="w-4 h-4 mr-1" />}
            items={[
              { label: "Galle", href: "/hotels/galle" },
              { label: "Kandy", href: "/hotels/kandy" },
              { label: "Colombo", href: "/hotels/colombo" },
              { label: "Arugambay", href: "/hotels/arugambay" },
              { label: "Ella", href: "/hotels/ella" },
              { label: "View All", href: "/hotels" },
            ]} 
          />
          
          <NavDropdown 
            title="Experiences" 
            icon={<Coffee className="w-4 h-4 mr-1" />}
            items={[
              { label: "Dining", href: "/experiences/dining" },
              { label: "Wellness & Spa", href: "/experiences/wellness" },
              { label: "Local Tours", href: "/experiences/tours" },
              { label: "Activities", href: "/experiences/activities" },
            ]} 
          />
          
          <Link href="/offers" className="text-sm font-medium hover:text-orange-500 transition-colors flex items-center">
            <CreditCard className="w-4 h-4 mr-1" />
            Special Offers
          </Link>
          
          <Link href="/contact" className="text-sm font-medium hover:text-orange-500 transition-colors flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/reservations" className="hidden md:block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </Link>
          
          {!session && (
            <Button 
              onClick={() => signIn("asgardeo", { callbackUrl: "/chat" })} 
              variant="outline"
              className="text-sm border-gray-300 hover:border-orange-500 hover:text-orange-500"
            >
              Sign in
            </Button>
          )}
          
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 p-0 h-10 w-10">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-orange-50 text-orange-500 font-medium">
                      {session.user?.name?.substring(0, 2)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" sideOffset={8} alignOffset={0}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-gray-500">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/bookings')} className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>My Bookings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}

// Navigation dropdown component
function NavDropdown({ title, items, icon }: NavDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-sm font-medium hover:text-orange-500 transition-colors">
          {icon}
          {title}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {items.map((item: NavDropdownItem, index: number) => (
          <DropdownMenuItem key={index} asChild>
            <Link href={item.href} className="cursor-pointer">
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
