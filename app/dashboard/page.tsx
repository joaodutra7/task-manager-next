"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CheckCircle, ListTodo, Loader2,Trash2 } from "lucide-react"
import { DashboardChart } from "@/components/dashboard-chart"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation"
import { Timestamp } from "firebase/firestore";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { listenToUserTasks, deleteTask, Task } from "../../lib/firestoreService";
import { toast } from "sonner";

// Helper para calcular progresso
const calculateProgress = (activities: Task['activities']): number => {
  if (!activities || activities.length === 0) {
    return 100;
  }
  const completedCount = activities.filter(a => a.completed).length;
  return Math.round((completedCount / activities.length) * 100);
};

// Helper para formatar Timestamp do Firestore
const formatFirestoreTimestamp = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) return 'Data inválida';
  try {
    const date = timestamp.toDate();
    // Formato exemplo: 15 de mai, 2024 (ajuste como preferir)
    return format(date, "dd 'de' MMM, yyyy", { locale: ptBR });
  } catch (e) {
    console.error("Erro ao formatar data:", e)
    return 'Erro na data';
  }
}

export default function DashboardPage() {

  const { user, loading: authLoading } = useAuth(); // Renomeado para evitar conflito
  const router = useRouter();

  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true); // Estado de loading para tarefas
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efeito para buscar tarefas quando o usuário estiver autenticado
  useEffect(() => {
    if (!authLoading && user) {
      setTasksLoading(true); 
      setError(null);

      const unsubscribe = listenToUserTasks(
        user.uid,
        (fetchedTasks) => {
          setTasks(fetchedTasks);
          setTasksLoading(false);
        },
        (err) => { // Callback de erro
          console.error("Falha ao buscar tarefas:", err);
          setError("Não foi possível carregar as tarefas.");
          setTasksLoading(false);
      });

      // Função de limpeza
      return () => unsubscribe();

    } else if (!authLoading && !user) {
      setTasks([]);
      setTasksLoading(false);
      router.push("/");
    }
  }, [user, authLoading, router]);

  // --- Handler para Deletar Tarefa ---
  const handleDeleteTask = async (taskId: string) => {

    if (!window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      await deleteTask(taskId);
      toast.success("Tarefa excluída com sucesso!");
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
      toast.error("Erro ao excluir tarefa.");
    }
  };

  // --- Calcular Resumos ---
  const totalTasks = tasks.length;

  // const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  // const completedTasks = tasks.filter(t => t.status === 'completed').length;

  // Renderização condicional enquanto autentica ou carrega tarefas
  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Carregando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Total Tarefas - Atualizado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tarefas</CardTitle>
            <ListTodo className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalTasks}</div>
          </CardContent>
        </Card>
        {/* Mockados */}
        {[
          { title: "Em Progresso", value: "8", icon: <Loader2 className="h-5 w-5 text-blue-500" /> },
          { title: "Finalizadas", value: "14", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
        ].map((card, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Tab Tarefas */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Tarefas</CardTitle>
              <CardDescription>Sua lista de tarefas.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mostrar estado de loading ou erro */}
              {tasksLoading && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando tarefas...
                </div>
              )}
              {error && <p className="text-red-600 text-center py-4">{error}</p>}

              {/* Mostrar tarefas se carregadas e sem erro */}
              {!tasksLoading && !error && (
                <div className="space-y-4">
                  {tasks.length === 0 ? (
                     <p className="text-center text-muted-foreground py-4">Nenhuma tarefa encontrada. Crie uma!</p>
                  ) : (
                    tasks.map((task) => {
                      const progress = calculateProgress(task.activities); // Calcula progresso
                      const formattedDate = formatFirestoreTimestamp(task.createdAt); // Formata data

                      return (
                        <div key={task.id} className="flex items-center gap-4 rounded-md border p-4 transition-all hover:shadow-sm">
                          {/* Indicador de Prioridade */}
                           <div className="flex-shrink-0"> {/* Evita que o ponto encolha */}
                            <div
                              title={`Prioridade: ${task.priority}`}
                              className={`h-3 w-3 rounded-full ${
                                task.priority === "high"
                                  ? "bg-destructive" // Vermelho
                                  : task.priority === "medium"
                                  ? "bg-yellow-500" // Amarelo/Âmbar
                                  : "bg-green-500" // Verde para baixa (ou primary)
                              }`}
                            />
                           </div>

                          {/* Detalhes da Tarefa */}
                          <div className="flex-1 min-w-0"> {/* min-w-0 previne overflow */}
                            <h3 className="font-medium truncate" title={task.title}>{task.title}</h3> {/* truncate e title */}
                            {task.description && <p className="text-sm text-muted-foreground truncate" title={task.description}>{task.description}</p>} {/* Descrição opcional */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>Criada em: {formattedDate}</span>
                            </div>
                             {/* Mostrar atividades*/}
                             {task.activities && task.activities.length > 0 && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                    {task.activities.length} atividade(s)
                                </div>
                             )}

                          </div>

                          {/* Progresso */}
                          <div className="flex w-1/4 md:w-1/5 items-center gap-2 flex-shrink-0"> {/* Ajuste largura e shrink */}
                            <Progress value={progress} className="flex-1" aria-label={`Progresso ${progress}%`} />
                            <span className="text-sm font-semibold">{progress}%</span>
                          </div>

                           {/* Botão Deletar */}
                           <Button
                             variant="ghost"
                             size="icon"
                             className="text-destructive hover:bg-destructive/10 flex-shrink-0"
                             onClick={() => handleDeleteTask(task.id)}
                             title="Excluir Tarefa"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da Tab Progresso */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progresso Geral</CardTitle>
              <CardDescription>Sua taxa de conclusão de tarefas ao longo do tempo.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {/* O componente DashboardChart precisaria receber os dados das tasks */}
              {/* <DashboardChart data={tasks} /> */}
              <DashboardChart /> {/* Mantendo como está por enquanto */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}