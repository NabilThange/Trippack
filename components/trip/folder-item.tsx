"use client"

import { useState } from "react"
import { Folder as FolderIcon, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskItem } from "./task-item"
import type { Folder, Task, TripWithDetails, Profile } from "@/lib/types"

interface FolderItemProps {
    folder: Folder
    tasks: Task[]
    userId: string
    username: string
    onTaskUpdate: () => void
}

export function FolderItem({ folder, tasks, userId, username, onTaskUpdate }: FolderItemProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div className="flex items-center gap-2 font-medium">
                    <FolderIcon className="h-4 w-4 text-primary" />
                    <span>{folder.name}</span>
                    <span className="text-muted-foreground text-sm">({tasks.length})</span>
                </div>
            </div>

            {isExpanded && (
                <div className="pl-4 space-y-2 border-l-2 border-border/50 ml-3">
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            userId={userId}
                            username={username}
                            onUpdate={onTaskUpdate}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="text-sm text-muted-foreground italic pl-4 py-2">
                            No items in this folder
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
