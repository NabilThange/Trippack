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
import type { Task, Folder } from "@/lib/types"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  onUpdated: () => void
}

export function EditTaskDialog({ open, onOpenChange, task, onUpdated }: EditTaskDialogProps) {
  const [text, setText] = useState(task.text)
  const [description, setDescription] = useState(task.description || "")
  const [deadline, setDeadline] = useState(task.deadline || "")
  const [folderId, setFolderId] = useState<string>(task.folder_id || "none")
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchFolders()
    }
  }, [open, task.trip_id])

  async function fetchFolders() {
    const { data } = await supabase
      .from("folders")
      .select("*")
      .eq("trip_id", task.trip_id)
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

    const { error } = await supabase
      .from("tasks")
      .update({
        text: text.trim(),
        description: description.trim() || null,
        deadline: deadline || null,
        folder_id: folderId === "none" ? null : folderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id)

    if (error) {
      toast.error("Failed to update task")
      setLoading(false)
      return
    }

    toast.success("Task updated!")
    onOpenChange(false)
    onUpdated()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>Update your packing item</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-text">Task Name *</Label>
            <Input
              id="edit-task-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Passport, Sunscreen, Charger"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-folder">Folder (optional)</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger id="edit-task-folder">
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
            <Label htmlFor="edit-task-description">Description (optional)</Label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-deadline">Deadline (optional)</Label>
            <Input id="edit-task-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
