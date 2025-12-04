import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { TripHeader } from "@/components/trip/trip-header"
import { TaskList } from "@/components/trip/task-list"
import { TripSidebar } from "@/components/trip/trip-sidebar"

interface TripPageProps {
  params: Promise<{ id: string }>
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params

  const session = await getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, created_at, updated_at")
    .eq("id", session.id)
    .single()

  if (!profile) {
    redirect("/auth/login")
  }

  const { data: trip } = await supabase
    .from("trips")
    .select(`
      *,
      owner:profiles!trips_owner_id_fkey(id, username)
    `)
    .eq("id", id)
    .single()

  if (!trip) {
    notFound()
  }

  const isOwner = trip.owner_id === profile.id

  return (
    <div className="min-h-screen bg-background">
      <TripHeader trip={trip} profile={profile} isOwner={isOwner} />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Main content area */}
          <div className="flex-1 min-w-0 order-1">
            <TaskList tripId={trip.id} userId={profile.id} username={profile.username} />
          </div>

          {/* Sidebar - moves to bottom on mobile */}
          <div className="w-full lg:w-80 flex-shrink-0 mt-8 lg:mt-0 order-2">
            <TripSidebar trip={trip} isOwner={isOwner} userId={profile.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
