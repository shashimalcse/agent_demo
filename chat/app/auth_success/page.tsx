"use client"
import React, { useEffect } from 'react';
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function AuthSuccess() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.close()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-orange-500" />
        </div>
        <h1 className="text-2xl font-serif">Authorization Successful</h1>
        <p className="text-muted-foreground">
          You have been successfully authorized. You can now close this window and continue with your jounery.
        </p>
        <p className="text-sm text-muted-foreground">
          This window will close automatically in a few seconds...
        </p>
      </Card>
    </div>
  )
}
