"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { Trip } from "@/lib/types"

interface TripSettingsDialogProps {
    trip: Trip
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TripSettingsDialog({ trip, open, onOpenChange }: TripSettingsDialogProps) {
    const [name, setName] = useState(trip.name)
    const [description, setDescription] = useState(trip.description || "")
    const [isPublic, setIsPublic] = useState(trip.is_public)
    const [autoApprove, setAutoApprove] = useState(trip.auto_approve_members || false)
    const [updating, setUpdating] = useState(false)
    const router = useRouter()

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setUpdating(true)

        try {
            const response = await fetch(`/api/trip/${trip.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                    is_public: isPublic,
                    auto_approve_members: autoApprove,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update settings")
            }

            toast.success("Settings updated")
            router.refresh()
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to update settings")
            console.error(error)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-2 border-border shadow-[6px_6px_0_0_var(--border)] sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Trip Settings</DialogTitle>
                    <DialogDescription>Manage settings for this trip.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="trip-name">Trip Name</Label>
                        <Input
                            id="trip-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Summer Vacation"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trip-description">Description</Label>
                        <Textarea
                            id="trip-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label htmlFor="is-public" className="font-medium">
                                Public Visibility
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Allow anyone with the link to view this trip.
                            </p>
                        </div>
                        <Switch
                            id="is-public"
                            checked={isPublic}
                            onCheckedChange={setIsPublic}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-1">
                            <Label htmlFor="auto-approve" className="font-medium">
                                Auto Approve Members
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically approve new members when they join via invite link.
                            </p>
                        </div>
                        <Switch
                            id="auto-approve"
                            checked={autoApprove}
                            onCheckedChange={setAutoApprove}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updating}>
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
