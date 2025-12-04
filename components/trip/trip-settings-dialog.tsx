"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Trip } from "@/lib/types"

interface TripSettingsDialogProps {
    trip: Trip
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TripSettingsDialog({ trip, open, onOpenChange }: TripSettingsDialogProps) {
    const [autoApprove, setAutoApprove] = useState(trip.auto_approve_members || false)
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function handleAutoApproveChange(checked: boolean) {
        setAutoApprove(checked)
        setUpdating(true)

        const { error } = await supabase
            .from("trips")
            .update({ auto_approve_members: checked })
            .eq("id", trip.id)

        if (error) {
            toast.error("Failed to update settings")
            setAutoApprove(!checked) // Revert
        } else {
            toast.success("Settings updated")
            router.refresh()
        }
        setUpdating(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-2 border-border shadow-[6px_6px_0_0_var(--border)]">
                <DialogHeader>
                    <DialogTitle>Trip Settings</DialogTitle>
                    <DialogDescription>Manage settings for this trip.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
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
                            onCheckedChange={handleAutoApproveChange}
                            disabled={updating}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
