"use client"

import { useSession } from "next-auth/react"
import { NavigationMenu } from "@/components/navigation-menu"
import UserBookings from "@/components/user-bookings"

export default function ProfilePage() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <NavigationMenu />
      </header>
      <main className="container max-w-7xl mx-auto pt-24 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-serif mb-8">My Profile</h1>
        {session ? (
          <>
            <p className="mb-4">Welcome, {session.user?.given_name}</p>
            <UserBookings />
          </>
        ) : (
          <p>Please sign in to view profile details.</p>
        )}
      </main>
    </div>
  )
}
