import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/header"
import { TripsList } from "@/components/dashboard/trips-list"
import { DiscoverTrips } from "@/components/dashboard/discover-trips"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        <Tabs defaultValue="my-trips" className="space-y-6">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-grid h-11 sm:h-10 border-2 border-border bg-muted p-1 rounded-xl">
            <TabsTrigger
              value="my-trips"
              className="rounded-lg font-medium text-sm data-[state=active]:bg-card data-[state=active]:shadow-[2px_2px_0_0_var(--border)]"
            >
              My Trips
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="rounded-lg font-medium text-sm data-[state=active]:bg-card data-[state=active]:shadow-[2px_2px_0_0_var(--border)]"
            >
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-trips" className="mt-6">
            <TripsList userId={profile.id} />
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            <DiscoverTrips userId={profile.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
