"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Folder } from "@/lib/types"

interface AddTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  userId: string
  username: string
  onAdded: () => void
}

export function AddTaskDialog({ open, onOpenChange, tripId, userId, username, onAdded }: AddTaskDialogProps) {
  const [text, setText] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [folderId, setFolderId] = useState<string>("none")
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchFolders()
    }
  }, [open, tripId])

  async function fetchFolders() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })

    setFolders(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!text.trim()) {
      toast.error("Task name is required")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("tasks").insert({
      trip_id: tripId,
      text: text.trim(),
      description: description.trim() || null,
      deadline: deadline || null,
      folder_id: folderId === "none" ? null : folderId,
      creator_id: userId,
      creator_name: username,
    })

    if (error) {
      toast.error("Failed to add task")
      setLoading(false)
      return
    }

    toast.success("Task added!")
    setText("")
    setDescription("")
    setDeadline("")
    setFolderId("none")
    onOpenChange(false)
    onAdded()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Add an item to your packing list</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-text">Task Name *</Label>
            <Input
              id="task-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Passport, Sunscreen, Charger"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-folder">Folder (optional)</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="task-folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description (optional)</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-deadline">Deadline (optional)</Label>
            <Input id="task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
