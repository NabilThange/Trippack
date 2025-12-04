"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plane, MapPin, Users, Loader2, Clock } from "lucide-react"
import { toast } from "sonner"
import type { Trip, Profile } from "@/lib/types"
import Link from "next/link"

interface JoinTripClientProps {
  trip: Trip & { owner: Profile }
  userId: string
  existingStatus: "pending" | "rejected" | null
}

export function JoinTripClient({ trip, userId, existingStatus }: JoinTripClientProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"pending" | "rejected" | null>(existingStatus)
  const router = useRouter()
  const supabase = createClient()

  async function handleJoinRequest() {
    setLoading(true)

    try {
      const response = await fetch("/api/trip/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tripId: trip.id }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("You have already requested to join this trip")
        } else {
          toast.error("Failed to send join request")
        }
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.status === "approved") {
        toast.success("You have successfully joined the trip!")
        router.push(`/trip/${trip.id}`)
      } else {
        toast.success("Join request sent! Waiting for owner approval.")
        setStatus("pending")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Plane className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">TripPack</span>
          </Link>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            {trip.name}
          </CardTitle>
          <CardDescription>You&apos;ve been invited to join this trip by {trip.owner?.username}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {trip.description && <p className="text-sm text-muted-foreground text-center">{trip.description}</p>}

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Created by {trip.owner?.username}</span>
          </div>

          {status === "pending" ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Request Pending</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your join request has been sent. Waiting for the trip owner to approve.
              </p>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : status === "rejected" ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">Your previous request was declined.</p>
              <Button onClick={handleJoinRequest} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button onClick={handleJoinRequest} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Request to Join
              </Button>
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
