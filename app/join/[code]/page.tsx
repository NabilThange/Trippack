import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JoinTripClient } from "@/components/join/join-trip-client"

interface JoinPageProps {
  params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const supabase = await createClient()

  const session = await getSession()

  // Get trip by invite code
  const { data: trip } = await supabase
    .from("trips")
    .select(`
      *,
      owner:profiles!trips_owner_id_fkey(id, username)
    `)
    .eq("invite_code", code)
    .single()

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid Invite Link</h1>
          <p className="text-muted-foreground mb-4">This invite link is invalid or has expired.</p>
          <a href="/" className="text-primary hover:underline">
            Go to homepage
          </a>
        </div>
      </div>
    )
  }

  // If not logged in, redirect to login with return URL
  if (!session) {
    redirect(`/auth/login?redirect=/join/${code}`)
  }

  // Check if user is the owner
  if (trip.owner_id === session.id) {
    redirect(`/trip/${trip.id}`)
  }

  // Check existing membership
  const { data: membership } = await supabase
    .from("trip_members")
    .select("status")
    .eq("trip_id", trip.id)
    .eq("user_id", session.id)
    .single()

  if (membership?.status === "approved") {
    redirect(`/trip/${trip.id}`)
  }

  return <JoinTripClient trip={trip} userId={session.id} existingStatus={membership?.status || null} />
}
