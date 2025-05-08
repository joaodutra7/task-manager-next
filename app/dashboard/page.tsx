// app/dashboard/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";
import { ListTodo, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation"

import { listenToUserTasks, deleteTask, Task, updateTaskActivities} from "../../lib/firestoreService";
import { toast } from '@/hooks/use-toast';

// --- Helpers (calculateProgress, formatFirestoreTimestamp)
const calculateProgress = (activities: Task['activities']): number => {
  if (!activities || activities.length === 0) {
    return 100;
  }
  const completedCount = activities.filter(a => a.completed).length;
  return Math.round((completedCount / activities.length) * 100);
};

// --- Fim Helpers ---


export default function DashboardPage() {

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Estados
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // --- Efeito para buscar tarefas (sem alterações) ---
  useEffect(() => {
    // if (!authLoading && user) {
    //   setTasksLoading(true);
    //   setError(null);
    //   const unsubscribe = listenToUserTasks(
    //     user.uid,
    //     (fetchedTasks) => {
    //       setTasks(fetchedTasks);
    //       setTasksLoading(false);
    //     },
    //     (err) => {
    //       console.error("Falha ao buscar tarefas:", err);
    //       setError("Não foi possível carregar as tarefas.");
    //       setTasksLoading(false);
    //     });
    //   return () => unsubscribe();
    // } else if (!authLoading && !user) {
    //   setTasks([]);
    //   setTasksLoading(false);
    //   router.push("/");
    // }
  }, [user, authLoading, router]);

  // --- Handlers ---

  // Handler para Deletar Tarefa
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({ title: "Sucesso!", description: "Tarefa excluída com sucesso!" });
    } catch (err) {
      toast({ title: "Erro", description: "Erro ao excluir a tarefa.", variant: 'destructive' });
    }
  };

  // Handler para Marcar/Desmarcar Atividade (toast já atualizado)
  const handleToggleActivity = async (taskId: string, activityIndex: number) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;
    const originalTask = tasks[taskIndex];
    const updatedTask = JSON.parse(JSON.stringify(originalTask)) as Task;
    if (activityIndex < 0 || activityIndex >= updatedTask.activities.length) return;

    updatedTask.activities[activityIndex].completed = !updatedTask.activities[activityIndex].completed;
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks); // Optimistic update

    try {
      await updateTaskActivities(taskId, updatedTask.activities);
      toast({ description: "Status da atividade atualizado." });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar alteração da atividade.", variant: "destructive" });
      const revertedTasks = [...tasks];
      revertedTasks[taskIndex] = originalTask;
      setTasks(revertedTasks);
    }
  };

  // Handler para ABRIR o modal de EDIÇÃO
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task); // Define a tarefa a ser editada
    setIsFormModalOpen(true); // Abre o modal
  };

  // Handler para ABRIR o modal de CRIAÇÃO
  const handleOpenCreateModal = () => {
    setEditingTask(null); // Garante que não há tarefa em edição
    setIsFormModalOpen(true); // Abre o modal
  };

  // Handler para FECHAR o modal
   const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingTask(null); // Limpa a tarefa em edição ao fechar
   };

  // --- Calcular Resumos ---
  const totalTasks = tasks.length;

  // --- Renderização Condicional Auth Loading ---
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /> Carregando...</div>;
  }
   // Renderização se não estiver logado
   if (!user) {
    return <div className="flex justify-center items-center min-h-screen text-muted-foreground">Redirecionando...</div>;
   }
  // --- Fim Renderização Condicional ---


  // --- JSX Principal ---
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 sm:p-6 md:p-8"> {/* Ajuste de padding/gap responsivo */}

      {/* Cabeçalho com Botão Nova Tarefa */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={handleOpenCreateModal}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tarefas</CardTitle>
            <ListTodo className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : totalTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Tarefas e Progresso */}
      <Tabs defaultValue="tasks">
        <TabsList className="mb-4"> {/* Adiciona margem inferior */}
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Tab Tarefas - Layout Ajustado */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Tarefas</CardTitle>
              <CardDescription>Sua lista de tarefas e atividades.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Estados de Loading/Erro/Nenhuma Tarefa */}
              {tasksLoading && ( <div className="flex justify-center items-center py-8"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando...</div> )}
              {error && <p className="text-red-600 text-center py-4">{error}</p>}
              {!tasksLoading && !error && tasks.length === 0 && ( <p className="text-center text-muted-foreground py-4">Nenhuma tarefa encontrada.</p> )}

              {/* Lista de Tarefas */}
              {!tasksLoading && !error && tasks.length > 0 && (
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const progress = calculateProgress(task.activities);

                    return (
                      // Container de cada Tarefa
                      <div key={task.id} className="rounded-md border p-4 transition-all hover:shadow-sm flex flex-col gap-3">

                        {/* Linha Superior: Prioridade, Título, Data, Progresso, Ações (Responsivo) */}
                        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                          {/* Prioridade */}
                          <div className="flex-shrink-0 pt-1 hidden sm:block"> {/* Oculta em mobile, aparece em sm+ */}
                             <div title={`Prioridade: ${task.priority}`}
                                  className={`h-3 w-3 rounded-full ${ task.priority === "high" ? "bg-destructive" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500" }`}
                              />
                          </div>

                          {/* Detalhes Principais (Título, Descrição, Data) */}
                          <div className="flex-1 min-w-0">
                             {/* Incluir prioridade no título em mobile */}
                             <div className="flex items-center gap-2 mb-0.5 sm:hidden">
                                 <div title={`Prioridade: ${task.priority}`}
                                    className={`h-2.5 w-2.5 rounded-full ${ task.priority === "high" ? "bg-destructive" : task.priority === "medium" ? "bg-yellow-500" : "bg-green-500" }`}
                                  />
                                 <span className="text-xs font-medium uppercase text-muted-foreground">{task.priority}</span>
                             </div>
                             <h3 className="font-semibold text-base sm:text-lg truncate" title={task.title}>{task.title}</h3>
                            {task.description && <p className="text-sm text-muted-foreground truncate mt-0.5" title={task.description}>{task.description}</p>}
                          </div>

                           {/* Seção Direita: Progresso e Botões de Ação */}
                           <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2 sm:gap-3 flex-shrink-0">
                              {/* Progresso */}
                              <div className="flex w-full sm:w-32 md:w-40 items-center gap-2">
                                <Progress value={progress} className="flex-1" aria-label={`Progresso ${progress}%`} />
                                <span className="text-sm font-semibold w-10 text-right">{progress}%</span>
                              </div>
                              {/* Botões de Ação (Editar/Excluir) */}
                              <div className="flex gap-2 self-end sm:self-auto">
                                <Button
                                  variant="outline" size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8" // Tamanho responsivo
                                  onClick={() => handleOpenEditModal(task)}
                                  title="Editar Tarefa"
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                                <Button
                                  variant="outline" size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Excluir Tarefa"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                           </div>
                        </div> {/* Fim da linha superior flex */}

                        {/* Seção de Atividades (Renderiza abaixo, se existirem) */}
                        {(task.activities && task.activities.length > 0) && (
                          <div className="pt-2 mt-2 border-t border-dashed space-y-1.5"> {/* Separador visual */}
                            {/* <h4 className="text-xs font-semibold text-muted-foreground mb-1">Atividades:</h4> */}
                            {task.activities.map((activity, index) => (
                              <div key={index} className="flex items-center gap-2 group pl-1"> {/* Leve indentação */}
                                <Checkbox
                                  id={`activity-${task.id}-${index}`}
                                  checked={activity.completed}
                                  onCheckedChange={() => handleToggleActivity(task.id, index)}
                                  aria-label={`Marcar atividade ${activity.text}`}
                                />
                                <label
                                  htmlFor={`activity-${task.id}-${index}`}
                                  className={`text-sm flex-1 cursor-pointer ${ activity.completed ? "line-through text-muted-foreground" : "text-foreground" } transition-colors`}
                                >
                                  {activity.text}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div> // Fim do container da Tarefa
                    );
                  })}
                </div> // Fim do space-y-4
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>


      {/* --- Modal de Criação/Edição de Tarefa --- */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
            <DialogContent className="sm:max-w-[500px]"> {/* Ajustar largura se necessário */}
              <DialogHeader>
                 {/* Título dinâmico baseado em editingTask */}
                <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Modifique os detalhes da tarefa abaixo.' : 'Preencha os detalhes da nova tarefa.'}
                </DialogDescription>
              </DialogHeader>
              {/* Passa a função para fechar e os dados iniciais (se houver) */}
              <TaskForm
                onSuccess={handleCloseFormModal}
                initialData={editingTask}
              />
            </DialogContent>
        </Dialog>

    </div>
  );
}