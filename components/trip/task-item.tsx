"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Pencil, Trash2, Calendar, Loader2, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Task, TaskPacker } from "@/lib/types"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { cn } from "@/lib/utils"

interface TaskItemProps {
  task: Task
  userId: string
  username: string
  onUpdate: () => void
}

export function TaskItem({ task, userId, username, onUpdate }: TaskItemProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [packers, setPackers] = useState<TaskPacker[]>([])
  const supabase = createClient()

  const isCreator = task.creator_id === userId
  const userHasPacked = packers.some((p) => p.user_id === userId)

  useEffect(() => {
    fetchPackers()

    const channel = supabase
      .channel(`task-packers-${task.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_packers", filter: `task_id=eq.${task.id}` },
        () => fetchPackers(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [task.id])

  async function fetchPackers() {
    const { data } = await supabase
      .from("task_packers")
      .select("*")
      .eq("task_id", task.id)
      .order("packed_at", { ascending: true })

    setPackers(data || [])
  }

  async function handleTogglePacked() {
    setToggling(true)

    if (userHasPacked) {
      const { error } = await supabase.from("task_packers").delete().eq("task_id", task.id).eq("user_id", userId)

      if (error) {
        toast.error("Failed to update")
        setToggling(false)
        return
      }
    } else {
      const { error } = await supabase.from("task_packers").insert({
        task_id: task.id,
        user_id: userId,
        user_name: username,
      })

      if (error) {
        toast.error("Failed to update")
        setToggling(false)
        return
      }
    }

    setToggling(false)
    fetchPackers()
    onUpdate()
  }

  async function handleDelete() {
    setDeleting(true)

    const { error } = await supabase.from("tasks").delete().eq("id", task.id)

    if (error) {
      toast.error("Failed to delete task")
      setDeleting(false)
      return
    }

    toast.success("Task deleted")
    onUpdate()
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  function getPackersText() {
    if (packers.length === 0) return null
    if (packers.length === 1) return `${packers[0].user_name} packed`
    if (packers.length === 2) return `${packers[0].user_name} & ${packers[1].user_name} packed`
    return `${packers[0].user_name} & ${packers.length - 1} others`
  }

  return (
    <>
      <div
        className={cn(
          "bg-card rounded-xl border-2 border-border p-3 sm:p-4 transition-all cursor-pointer",
          "shadow-[3px_3px_0_0_var(--border)] hover:shadow-[4px_4px_0_0_var(--border)]",
          "hover:translate-x-[-1px] hover:translate-y-[-1px]",
          "active:shadow-none active:translate-x-0 active:translate-y-0",
          packers.length > 0 && "bg-accent/10 border-accent/30",
        )}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox - larger touch target */}
          <div className="pt-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {toggling ? (
              <div className="h-6 w-6 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Checkbox
                checked={userHasPacked}
                onCheckedChange={handleTogglePacked}
                className="h-6 w-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "font-medium text-sm sm:text-base leading-snug",
                  userHasPacked && "line-through text-muted-foreground",
                )}
              >
                {task.text}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              <span>by {task.creator_name}</span>

              {packers.length > 0 && (
                <span className="flex items-center gap-1 text-primary font-medium">
                  <Users className="h-3 w-3" />
                  {getPackersText()}
                </span>
              )}

              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.deadline)}
                </span>
              )}
            </div>
          </div>

          {/* Actions - larger touch targets */}
          {isCreator && (
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-border shadow-[4px_4px_0_0_var(--border)]">
                  <DropdownMenuItem onClick={() => setShowEdit(true)} className="py-2.5">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="text-destructive py-2.5">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <EditTaskDialog open={showEdit} onOpenChange={setShowEdit} task={task} onUpdated={onUpdate} />
      <TaskDetailDialog open={showDetail} onOpenChange={setShowDetail} task={task} packers={packers} />
    </>
  )
}
