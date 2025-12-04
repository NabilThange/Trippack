"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Task } from "@/lib/types"

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
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

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
