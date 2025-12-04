"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Luggage, LogOut, User } from "lucide-react"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"
import { EditProfileDialog } from "@/components/dashboard/edit-profile-dialog"
import { clearClientSession } from "@/lib/auth-client"

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    clearClientSession()
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  const initials = profile.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center">
              <Luggage className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight">TripPack</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-2 border-border shadow-[4px_4px_0_0_var(--border)]">
              <div className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{profile.username}</span>
                  <span className="text-xs text-muted-foreground">Member</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowEditProfile(true)} className="py-2.5">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive py-2.5">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <EditProfileDialog open={showEditProfile} onOpenChange={setShowEditProfile} profile={profile} />
    </>
  )
}
