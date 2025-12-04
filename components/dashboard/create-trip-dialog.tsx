"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Globe, Lock, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  userId: string
}

export function CreateTripDialog({ open, onOpenChange, onCreated, userId }: CreateTripDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [destination, setDestination] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (name.trim().length < 2) {
      toast.error("Trip name must be at least 2 characters")
      return
    }

    if (!userId) {
      toast.error("Please sign in first")
      return
    }

    // Validate dates if both are provided
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date")
      return
    }

    setLoading(true)

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        owner_id: userId,
        destination: destination.trim() || null,
        start_date: startDate || null,
        end_date: endDate || null,
        is_public: isPublic,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create trip")
      setLoading(false)
      return
    }

    toast.success("Trip created!")
    // Reset form
    setName("")
    setDescription("")
    setDestination("")
    setStartDate("")
    setEndDate("")
    setIsPublic(true)
    onOpenChange(false)
    onCreated()
    router.push(`/trip/${trip.id}`)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
          <DialogDescription>Start planning your next adventure</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Trip Name */}
          <div className="space-y-2">
            <Label htmlFor="trip-name">Trip Name *</Label>
            <Input
              id="trip-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Hawaii 2025, Europe Trip"
              required
            />
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="trip-destination" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Destination
            </Label>
            <Input
              id="trip-destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Paris, France"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip-start-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                id="trip-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trip-end-date">End Date</Label>
              <Input
                id="trip-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="trip-description">Description</Label>
            <Textarea
              id="trip-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details about your trip..."
              rows={3}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {isPublic ? <Globe className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-amber-600" />}
              <div>
                <p className="font-medium text-sm">{isPublic ? "Public Trip" : "Private Trip"}</p>
                <p className="text-xs text-muted-foreground">
                  {isPublic ? "Anyone with the link can view and join" : "Only invited members can access"}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} aria-label="Toggle trip visibility" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
