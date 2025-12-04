"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Share2, Copy, Check, Crown, Loader2, UserX, Clock, MapPin, Calendar, Globe, Lock } from "lucide-react"
import { toast } from "sonner"
import type { Trip, Profile, TripMember } from "@/lib/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface TripSidebarProps {
  trip: Trip & { owner: Profile }
  isOwner: boolean
  userId: string
}

interface MemberWithProfile extends TripMember {
  user: Profile
}

export function TripSidebar({ trip, isOwner, userId }: TripSidebarProps) {
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [pendingRequests, setPendingRequests] = useState<MemberWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState(true)
  const [membersOpen, setMembersOpen] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchMembers()

    const channel = supabase
      .channel(`members-${trip.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${trip.id}` },
        () => fetchMembers(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [trip.id])

  async function fetchMembers() {
    const { data } = await supabase
      .from("trip_members")
      .select(`
        *,
        user:profiles!trip_members_user_id_fkey(*)
      `)
      .eq("trip_id", trip.id)

    if (data) {
      setMembers(data.filter((m) => m.status === "approved") as MemberWithProfile[])
      setPendingRequests(data.filter((m) => m.status === "pending") as MemberWithProfile[])
    }

    setLoading(false)
  }

  async function copyInviteLink() {
    const inviteUrl = `${window.location.origin}/join/${trip.invite_code}`
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    toast.success("Invite link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleApprove(memberId: string) {
    setProcessingId(memberId)
    const { error } = await supabase.from("trip_members").update({ status: "approved" }).eq("id", memberId)
    if (error) {
      toast.error("Failed to approve member")
    } else {
      toast.success("Member approved!")
    }
    setProcessingId(null)
    fetchMembers()
  }

  async function handleReject(memberId: string) {
    setProcessingId(memberId)
    const { error } = await supabase.from("trip_members").delete().eq("id", memberId)
    if (error) {
      toast.error("Failed to reject request")
    } else {
      toast.success("Request rejected")
    }
    setProcessingId(null)
    fetchMembers()
  }

  async function handleRemoveMember(memberId: string) {
    setProcessingId(memberId)
    const { error } = await supabase.from("trip_members").delete().eq("id", memberId)
    if (error) {
      toast.error("Failed to remove member")
    } else {
      toast.success("Member removed")
    }
    setProcessingId(null)
    fetchMembers()
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Trip Info - Collapsible on mobile */}
      <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
        <div className="bg-card rounded-xl border-2 border-border overflow-hidden shadow-[4px_4px_0_0_var(--border)]">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <h3 className="font-semibold">About this Trip</h3>
            <ChevronDown className={cn("h-5 w-5 transition-transform", aboutOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {trip.description && <p className="text-sm text-muted-foreground">{trip.description}</p>}

              <div className="space-y-2 text-sm">
                {trip.destination && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{trip.destination}</span>
                  </div>
                )}

                {trip.start_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {formatDate(trip.start_date)}
                      {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  {trip.is_public ? (
                    <>
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <span>Public trip</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 flex-shrink-0" />
                      <span>Private trip</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Owned by {trip.owner?.username}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Invite Link - Owner only */}
      {isOwner && (
        <div className="bg-card rounded-xl border-2 border-border p-4 shadow-[4px_4px_0_0_var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Invite Link</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Share this link to invite friends</p>
          <Button
            variant="outline"
            className="w-full justify-between bg-background border-2 h-11 font-mono text-xs"
            onClick={copyInviteLink}
          >
            <span className="truncate">/join/{trip.invite_code}</span>
            {copied ? (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <Copy className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
        </div>
      )}

      {/* Pending Requests - Owner only */}
      {isOwner && pendingRequests.length > 0 && (
        <div className="bg-card rounded-xl border-2 border-border p-4 shadow-[4px_4px_0_0_var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-warning" />
            <h3 className="font-semibold">Pending ({pendingRequests.length})</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 border-2 border-border flex-shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(request.user?.username || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{request.user?.username}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                    className="h-8 w-8 p-0 border-2"
                  >
                    {processingId === request.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                    className="h-8 w-8 p-0 border-2"
                  >
                    <UserX className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members - Collapsible */}
      <Collapsible open={membersOpen} onOpenChange={setMembersOpen}>
        <div className="bg-card rounded-xl border-2 border-border overflow-hidden shadow-[4px_4px_0_0_var(--border)]">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Members ({members.length + 1})</h3>
            </div>
            <ChevronDown className={cn("h-5 w-5 transition-transform", membersOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {/* Owner */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-9 w-9 border-2 border-primary flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(trip.owner?.username || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{trip.owner?.username}</span>
                    <span className="text-xs text-primary">Owner</span>
                  </div>
                </div>
              </div>

              {/* Members */}
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-9 w-9 border-2 border-border flex-shrink-0">
                        <AvatarFallback className="text-xs font-medium">
                          {getInitials(member.user?.username || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">
                        {member.user?.username}
                        {member.user_id === userId && " (You)"}
                      </span>
                    </div>
                    {isOwner && member.user_id !== userId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={processingId === member.id}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        {processingId === member.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
