"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Loader2, MapPin, Search, UserPlus, Clock, Check } from "lucide-react"
import { toast } from "sonner"
import type { Trip, Profile } from "@/lib/types"

interface DiscoverTripsProps {
  userId: string
}

interface PublicTrip extends Trip {
  owner: Profile
  member_count: number
  membership_status: "owner" | "approved" | "pending" | "none"
}

export function DiscoverTrips({ userId }: DiscoverTripsProps) {
  const [trips, setTrips] = useState<PublicTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [requestingTripId, setRequestingTripId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTrips()
  }, [userId])

  async function fetchTrips() {
    // Get all trips
    const { data: allTrips } = await supabase
      .from("trips")
      .select(`
        *,
        owner:profiles!trips_owner_id_fkey(*)
      `)
      .order("created_at", { ascending: false })

    if (!allTrips) {
      setLoading(false)
      return
    }

    // Get user's memberships
    const { data: memberships } = await supabase.from("trip_members").select("trip_id, status").eq("user_id", userId)

    const membershipMap = new Map(memberships?.map((m) => [m.trip_id, m.status]) || [])

    const publicTrips: PublicTrip[] = []

    for (const trip of allTrips) {
      // Get member count
      const { count: memberCount } = await supabase
        .from("trip_members")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", trip.id)
        .eq("status", "approved")

      let membershipStatus: "owner" | "approved" | "pending" | "none" = "none"
      if (trip.owner_id === userId) {
        membershipStatus = "owner"
      } else if (membershipMap.has(trip.id)) {
        membershipStatus = membershipMap.get(trip.id) as "approved" | "pending"
      }

      publicTrips.push({
        ...trip,
        member_count: (memberCount || 0) + 1,
        membership_status: membershipStatus,
      })
    }

    setTrips(publicTrips)
    setLoading(false)
  }

  async function handleRequestJoin(tripId: string) {
    setRequestingTripId(tripId)

    const { error } = await supabase.from("trip_members").insert({
      trip_id: tripId,
      user_id: userId,
      status: "pending",
    })

    if (error) {
      toast.error("Failed to send join request")
      setRequestingTripId(null)
      return
    }

    toast.success("Join request sent!")
    fetchTrips()
    setRequestingTripId(null)
  }

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.owner?.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Discover Trips</h2>
        <p className="text-muted-foreground">Find and request to join trips from others</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trips by name or owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTrips.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No trips found</h3>
            <p className="text-muted-foreground text-sm text-center">
              {searchQuery ? "Try a different search term" : "No public trips available yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {trip.name}
                </CardTitle>
                <CardDescription>By {trip.owner?.username}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{trip.member_count} members</span>
                  </div>
                </div>

                {trip.membership_status === "owner" && (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    You own this trip
                  </Button>
                )}

                {trip.membership_status === "approved" && (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    <Check className="mr-2 h-4 w-4" />
                    Already a member
                  </Button>
                )}

                {trip.membership_status === "pending" && (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    <Clock className="mr-2 h-4 w-4" />
                    Request pending
                  </Button>
                )}

                {trip.membership_status === "none" && (
                  <Button
                    className="w-full"
                    onClick={() => handleRequestJoin(trip.id)}
                    disabled={requestingTripId === trip.id}
                  >
                    {requestingTripId === trip.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Request to Join
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
