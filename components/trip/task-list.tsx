"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Loader2, CheckSquare, FolderPlus } from "lucide-react"
import { toast } from "sonner"
import type { Task, Folder } from "@/lib/types"
import { TaskItem } from "./task-item"
import { FolderItem } from "./folder-item"
import { AddTaskDialog } from "./add-task-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface TaskListProps {
  tripId: string
  userId: string
  username: string
}

export function TaskList({ tripId, userId, username }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [quickTaskText, setQuickTaskText] = useState("")
  const [addingQuick, setAddingQuick] = useState(false)
  const [userPackedCount, setUserPackedCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchData()

    const tasksChannel = supabase
      .channel(`tasks-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `trip_id=eq.${tripId}` }, () =>
        fetchData(),
      )
      .subscribe()

    const foldersChannel = supabase
      .channel(`folders-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "folders", filter: `trip_id=eq.${tripId}` }, () =>
        fetchFolders(),
      )
      .subscribe()

    const packersChannel = supabase
      .channel(`task-packers-trip-${tripId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "task_packers" }, () => fetchUserPackedCount())
      .subscribe()

    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(foldersChannel)
      supabase.removeChannel(packersChannel)
    }
  }, [tripId, userId])

  async function fetchData() {
    await Promise.all([fetchTasks(), fetchFolders(), fetchUserPackedCount()])
    setLoading(false)
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })

    setTasks(data || [])
  }

  async function fetchFolders() {
    const response = await fetch(`/api/trip/${tripId}/folders`)
    if (response.ok) {
      const data = await response.json()
      setFolders(data)
    }
  }

  async function fetchUserPackedCount() {
    const { data: taskIds } = await supabase.from("tasks").select("id").eq("trip_id", tripId)

    if (!taskIds || taskIds.length === 0) {
      setUserPackedCount(0)
      return
    }

    const { count } = await supabase
      .from("task_packers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in(
        "task_id",
        taskIds.map((t) => t.id),
      )

    setUserPackedCount(count || 0)
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()

    if (!quickTaskText.trim()) return

    setAddingQuick(true)

    const { error } = await supabase.from("tasks").insert({
      trip_id: tripId,
      text: quickTaskText.trim(),
      creator_id: userId,
      creator_name: username,
    })

    if (error) {
      toast.error("Failed to add task")
      setAddingQuick(false)
      return
    }

    setQuickTaskText("")
    setAddingQuick(false)
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return

    setCreatingFolder(true)
    try {
      const response = await fetch(`/api/trip/${tripId}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      toast.success("Folder created")
      setNewFolderName("")
      setShowAddFolder(false)
      fetchFolders()
    } catch (error) {
      toast.error("Failed to create folder")
    } finally {
      setCreatingFolder(false)
    }
  }

  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? (userPackedCount / totalCount) * 100 : 0

  const tasksInFolders = tasks.filter((t) => t.folder_id)
  const tasksWithoutFolder = tasks.filter((t) => !t.folder_id)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Packing List</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount === 0 ? "No items yet" : `You packed ${userPackedCount} of ${totalCount} items`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setShowAddFolder(true)}
            className="flex-1 sm:flex-none h-11 border-2"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button
            onClick={() => setShowAddTask(true)}
            className="flex-1 sm:flex-none h-11 font-semibold border-2 border-primary/20 shadow-[3px_3px_0_0_var(--primary)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="w-full bg-secondary rounded-full h-3 border-2 border-border overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Quick add form */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          placeholder="Quick add an item..."
          value={quickTaskText}
          onChange={(e) => setQuickTaskText(e.target.value)}
          disabled={addingQuick}
          className="h-11 sm:h-12 text-base border-2 bg-card"
        />
        <Button
          type="submit"
          disabled={addingQuick || !quickTaskText.trim()}
          size="icon"
          className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 border-2 border-primary/20 shadow-[2px_2px_0_0_var(--primary)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          {addingQuick ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
        </Button>
      </form>

      {/* Folders List */}
      <div className="space-y-2">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            tasks={tasks.filter((t) => t.folder_id === folder.id)}
            userId={userId}
            username={username}
            onTaskUpdate={() => {
              fetchTasks()
              fetchUserPackedCount()
            }}
          />
        ))}
      </div>

      {/* Task list (Unfoldered) */}
      {tasks.length === 0 && folders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No items yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Add your first packing item to get started
          </p>
          <Button
            onClick={() => setShowAddTask(true)}
            className="h-11 font-semibold border-2 border-primary/20 shadow-[3px_3px_0_0_var(--primary)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {tasksWithoutFolder.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              userId={userId}
              username={username}
              onUpdate={() => {
                fetchTasks()
                fetchUserPackedCount()
              }}
            />
          ))}
        </div>
      )}

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        tripId={tripId}
        userId={userId}
        username={username}
        onAdded={() => {
          fetchTasks()
          fetchUserPackedCount()
        }}
      />

      <Dialog open={showAddFolder} onOpenChange={setShowAddFolder}>
        <DialogContent className="border-2 border-border shadow-[6px_6px_0_0_var(--border)]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Organize your packing list with folders.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="e.g. Toiletries, Electronics"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={creatingFolder || !newFolderName.trim()}>
              {creatingFolder ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
