"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskForm } from "@/components/task-form"
import { CalendarIcon, CheckCircle, ChevronDown, Clock, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"

// Task data (would normally come from API/database)
const initialTasks = [
  {
    id: "task-1",
    title: "Complete project proposal",
    description: "Write and finalize project proposal document for client review",
    status: "in-progress",
    priority: "high",
    date: "Today",
    completed: false,
  },
  {
    id: "task-2",
    title: "Review client feedback",
    description: "Go through client feedback and prepare response",
    status: "in-progress",
    priority: "medium",
    date: "Tomorrow",
    completed: false,
  },
  {
    id: "task-3",
    title: "Research new technologies",
    description: "Explore new technologies for upcoming project",
    status: "to-do",
    priority: "low",
    date: "Wed, May 15",
    completed: false,
  },
  {
    id: "task-4",
    title: "Prepare presentation slides",
    description: "Create presentation slides for the client meeting",
    status: "to-do",
    priority: "medium",
    date: "Fri, May 17",
    completed: false,
  },
  {
    id: "task-5",
    title: "Update documentation",
    description: "Update project documentation with latest changes",
    status: "done",
    priority: "low",
    date: "Yesterday",
    completed: true,
  },
  {
    id: "task-6",
    title: "Fix navigation bug",
    description: "Fix the navigation issue reported in the app",
    status: "done",
    priority: "high",
    date: "May 10",
    completed: true,
  },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  
  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === "done" ? "to-do" : "done"
        return { 
          ...task, 
          status: newStatus,
          completed: newStatus === "done"
        }
      }
      return task
    }))
  }
  
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your list
                </DialogDescription>
              </DialogHeader>
              <TaskForm />
              <DialogFooter className="mt-4">
                <Button type="submit" form="task-form">Create Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1">
          <Clock className="h-4 w-4" />
          <span>Filter by Date</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <span>Priority</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="to-do">To Do</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>
        
        {["all", "to-do", "in-progress", "done"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {tab === "all" 
                    ? "All Tasks" 
                    : tab === "to-do" 
                    ? "To Do" 
                    : tab === "in-progress" 
                    ? "In Progress" 
                    : "Completed"}
                </CardTitle>
                <CardDescription>
                  {tab === "all" 
                    ? "Manage all your tasks" 
                    : tab === "to-do" 
                    ? "Tasks waiting to be started" 
                    : tab === "in-progress" 
                    ? "Tasks currently in progress" 
                    : "Tasks you've completed"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks
                    .filter(task => tab === "all" || task.status === tab)
                    .map((task) => (
                      <div key={task.id} className="flex items-start gap-4 rounded-md border p-4">
                        <Checkbox 
                          id={task.id} 
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskStatus(task.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h3>
                            <div
                              className={`h-2 w-2 rounded-full ${
                                task.priority === "high"
                                  ? "bg-destructive"
                                  : task.priority === "medium"
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              }`}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>Due {task.date}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}