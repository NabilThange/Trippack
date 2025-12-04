"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Package, Clock } from "lucide-react"
import type { Task, TaskPacker } from "@/lib/types"

interface TaskDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  packers: TaskPacker[]
}

export function TaskDetailDialog({ open, onOpenChange, task, packers }: TaskDetailDialogProps) {
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  function formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {task.text}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Details */}
          <div className="space-y-3">
            {task.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{task.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  Added by <span className="font-medium">{task.creator_name}</span>
                </span>
              </div>

              {task.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due {formatDate(task.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Packers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Who Packed This</h4>
              <Badge variant={packers.length > 0 ? "default" : "secondary"}>
                {packers.length} {packers.length === 1 ? "person" : "people"}
              </Badge>
            </div>

            {packers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one has packed this item yet.</p>
            ) : (
              <div className="space-y-2">
                {packers.map((packer) => (
                  <div key={packer.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getInitials(packer.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{packer.user_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(packer.packed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
