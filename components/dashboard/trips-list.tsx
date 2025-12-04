"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Users, CheckSquare, Loader2, MapPin, Calendar, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { CreateTripDialog } from "./create-trip-dialog"
import type { Trip, Profile } from "@/lib/types"

interface TripsListProps {
  userId: string
}

interface TripWithOwner extends Trip {
  owner: Profile
  member_count: number
  task_count: number
}

export function TripsList({ userId }: TripsListProps) {
  const [trips, setTrips] = useState<TripWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTrips()

    const channel = supabase
      .channel("my-trips")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, () => fetchTrips())
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_members" }, () => fetchTrips())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function fetchTrips() {
    const { data: ownedTrips } = await supabase
      .from("trips")
      .select(`*, owner:profiles!trips_owner_id_fkey(*)`)
      .eq("owner_id", userId)

    const { data: memberTrips } = await supabase
      .from("trip_members")
      .select(`trip:trips(*, owner:profiles!trips_owner_id_fkey(*))`)
      .eq("user_id", userId)
      .eq("status", "approved")

    const allTrips: TripWithOwner[] = []

    if (ownedTrips) {
      for (const trip of ownedTrips) {
        const { count: memberCount } = await supabase
          .from("trip_members")
          .select("*", { count: "exact", head: true })
          .eq("trip_id", trip.id)
          .eq("status", "approved")

        const { count: taskCount } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("trip_id", trip.id)

        allTrips.push({
          ...trip,
          member_count: (memberCount || 0) + 1,
          task_count: taskCount || 0,
        })
      }
    }

    if (memberTrips) {
      for (const item of memberTrips) {
        if (item.trip) {
          const trip = item.trip as unknown as Trip & { owner: Profile }

          const { count: memberCount } = await supabase
            .from("trip_members")
            .select("*", { count: "exact", head: true })
            .eq("trip_id", trip.id)
            .eq("status", "approved")

          const { count: taskCount } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("trip_id", trip.id)

          allTrips.push({
            ...trip,
            member_count: (memberCount || 0) + 1,
            task_count: taskCount || 0,
          })
        }
      }
    }

    setTrips(allTrips)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">My Trips</h2>
          <p className="text-sm text-muted-foreground">Trips you own or have joined</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto h-11 font-semibold border-2 border-primary/20 shadow-[3px_3px_0_0_var(--primary)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No trips yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Create your first trip or discover trips to join
          </p>
          <Button
            onClick={() => setShowCreate(true)}
            className="h-11 font-semibold border-2 border-primary/20 shadow-[3px_3px_0_0_var(--primary)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trip/${trip.id}`}>
              <div className="h-full bg-card rounded-xl border-2 border-border p-4 sm:p-5 shadow-[4px_4px_0_0_var(--border)] hover:shadow-[6px_6px_0_0_var(--border)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-none active:translate-x-0 active:translate-y-0 transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base truncate">{trip.name}</h3>
                  </div>
                  {trip.is_public ? (
                    <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                {trip.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{trip.description}</p>
                )}

                {/* Destination & Date */}
                {(trip.destination || trip.start_date) && (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    {trip.destination && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {trip.destination}
                      </span>
                    )}
                    {trip.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(trip.start_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{trip.member_count}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>{trip.task_count}</span>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {trip.owner_id === userId ? "Owner" : `By ${trip.owner?.username}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateTripDialog open={showCreate} onOpenChange={setShowCreate} onCreated={fetchTrips} userId={userId} />
    </div>
  )
}
