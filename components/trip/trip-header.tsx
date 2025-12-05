"use client"

import Link from "next/link"
import { clearClientSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Luggage, ArrowLeft, LogOut, MoreVertical, Trash2, Settings } from "lucide-react"
import { toast } from "sonner"
import type { Trip, Profile } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { TripSettingsDialog } from "./trip-settings-dialog"

interface TripHeaderProps {
  trip: Trip & { owner: Profile }
  profile: Profile
  isOwner: boolean
}

export function TripHeader({ trip, profile, isOwner }: TripHeaderProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const initials = profile.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    clearClientSession()
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  async function handleDeleteTrip() {
    setDeleting(true)

    try {
      const response = await fetch(`/api/trip/${trip.id}`, { method: "DELETE" })

      if (!response.ok) {
        toast.error("Failed to delete trip")
        setDeleting(false)
        return
      }

      toast.success("Trip deleted")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Failed to delete trip")
      setDeleting(false)
    }
  }

  return (
    <>
      <header className="border-b-2 border-border bg-card sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="hidden sm:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Your Trips</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{trip.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <span className="font-semibold text-sm truncate">{trip.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-border shadow-[4px_4px_0_0_var(--border)]">
                  <DropdownMenuItem onClick={() => setShowSettingsDialog(true)} className="py-2.5">
                    <Settings className="mr-2 h-4 w-4" />
                    Trip Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive py-2.5" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Trip
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-2 border-border shadow-[4px_4px_0_0_var(--border)]"
              >
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{profile.username}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="py-2.5">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive py-2.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <TripSettingsDialog trip={trip} open={showSettingsDialog} onOpenChange={setShowSettingsDialog} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-2 border-border shadow-[6px_6px_0_0_var(--border)] mx-4 sm:mx-0 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{trip.name}&quot;? This will permanently delete all tasks and remove
              all members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="border-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrip}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-destructive/20"
            >
              {deleting ? "Deleting..." : "Delete Trip"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
