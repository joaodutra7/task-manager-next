"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CheckCircle, Clock, ListTodo, Loader2, PlusCircle, XCircle } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"; 
import { useRouter } from "next/navigation"


export default function DashboardPage() {

  const { user, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Only redirect after auth state is confirmed (not loading)
    if (!loading && !user) {
      setRedirecting(true)
      // Set a small timeout to show the message before redirecting
      const timeout = setTimeout(() => {
        router.push("/")
      }, 10000)

      return () => clearTimeout(timeout)
    }
  }, [user, loading, router])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Tarefas", value: "24", icon: <ListTodo className="h-5 w-5 text-gray-500" /> },
          { title: "Em Progresso", value: "8", icon: <Loader2 className="h-5 w-5 text-blue-500" /> },
          { title: "Finalizadas", value: "14", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { title: "Em Atraso", value: "2", icon: <XCircle className="h-5 w-5 text-red-500" /> },
        ].map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {i === 0
                  ? "+5 from last week"
                  : i === 1
                  ? "2 due today"
                  : i === 2
                  ? "+3 from yesterday"
                  : "Action needed"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas</CardTitle>
              <CardDescription>Tarefas em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Complete project proposal",
                    date: "Today",
                    priority: "high",
                    progress: 75,
                  },
                  {
                    title: "Review client feedback",
                    date: "Tomorrow",
                    priority: "medium",
                    progress: 45,
                  },
                  {
                    title: "Research new technologies",
                    date: "Wed, May 15",
                    priority: "low",
                    progress: 20,
                  },
                  {
                    title: "Prepare presentation slides",
                    date: "Fri, May 17",
                    priority: "medium",
                    progress: 10,
                  },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-md border p-4">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        task.priority === "high"
                          ? "bg-destructive"
                          : task.priority === "medium"
                          ? "bg-amber-500"
                          : "bg-primary"
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Data {task.date}</span>
                      </div>
                    </div>
                    <div className="flex w-1/3 items-center gap-2">
                      <Progress value={task.progress} />
                      <span className="text-sm">{task.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>Ver todas</span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progresso da Tarefa</CardTitle>
              <CardDescription>Sua taxa de conclusão de tarefas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <DashboardChart />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}