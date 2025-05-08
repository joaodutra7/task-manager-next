// components/task-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { createTask, updateTask, Task } from "@/lib/firestoreService";

// Definir tipo para uma atividade (pode ser importado do service se já definido lá)
interface Activity {
  text: string;
  completed: boolean;
}

// Adicionar prop para dados iniciais e ID da tarefa
interface TaskFormProps {
  onSuccess?: () => void;
  initialData?: Task | null; // Tarefa a ser editada (inclui ID)
}

export function TaskForm({ onSuccess, initialData }: TaskFormProps) {
  const { user } = useAuth();

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivityText, setNewActivityText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para controlar se estamos editando
  const [isEditing, setIsEditing] = useState(false);

  // Efeito para preencher o formulário quando 'initialData' mudar (para edição)
  useEffect(() => {
    if (initialData) {
      console.log("TaskForm recebendo initialData para edição:", initialData);
      setIsEditing(true); // Define que estamos editando
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPriority(initialData.priority || "medium");
      // Garante que activities seja um array, mesmo que venha null/undefined ou do Firestore
      setActivities(Array.isArray(initialData.activities) ? initialData.activities : []);
      setNewActivityText(""); // Limpa o campo de nova atividade
    } else {
      // Resetar formulário se não houver dados iniciais (modo criação)
      setIsEditing(false);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setActivities([]);
      setNewActivityText("");
    }
  }, [initialData]); // Dependência: re-executa quando initialData muda

  const handleAddActivity = () => {
    if (newActivityText.trim() !== "") {
      // Verifica se a atividade já existe (case-insensitive)
      const alreadyExists = activities.some(
          (act) => act.text.toLowerCase() === newActivityText.trim().toLowerCase()
      );
      if (alreadyExists) {
          toast({
              title: "Atenção",
              description: "Essa atividade já foi adicionada.",
              variant: "default", // ou outra variante se preferir
          });
          return;
      }

      setActivities([
        ...activities,
        { text: newActivityText.trim(), completed: false },
      ]);
      setNewActivityText("");
    }
  };

  const handleRemoveActivity = (indexToRemove: number) => {
    setActivities(activities.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({ title: "Erro de Autenticação", description: "Você precisa estar logado.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    if (!title.trim()) {
       toast({ title: "Campo Obrigatório", description: "O título da tarefa não pode ficar em branco.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Dados comuns para criação e atualização
    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      userId: user.uid, // Necessário para regras de segurança e query
      activities,
    };

    try {
      if (isEditing && initialData?.id) {
        // --- Modo Edição ---
        // Passa o ID e o payload com os campos que podem ser atualizados
        await updateTask(initialData.id, {
            title: taskPayload.title,
            description: taskPayload.description,
            priority: taskPayload.priority,
            activities: taskPayload.activities,
            // Não atualizamos userId, createdAt ou status aqui diretamente
        });
        toast({ title: "Sucesso", description: "Tarefa atualizada com sucesso!" });
      } else {
        // --- Modo Criação ---
        await createTask({
          ...taskPayload,
          status: 'pending', // Adiciona status inicial
        });
        toast({ title: "Sucesso", description: "Tarefa criada com sucesso!" });
        // Limpar formulário apenas na criação bem-sucedida
        setTitle("");
        setDescription("");
        setPriority("medium");
        setActivities([]);
        setNewActivityText("");
      }

      onSuccess?.(); // Fecha o modal ou executa outra ação

    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast({
        title: "Erro ao Salvar",
        description: `Falha ao ${isEditing ? 'atualizar' : 'criar'} tarefa. Tente novamente.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Formulário principal
    <form id="task-form" onSubmit={handleSubmit} className="grid gap-4 py-4">

      {/* Campo Título */}
      <div className="grid gap-1.5"> {/* Ajustado gap */}
        <Label htmlFor="title">Nome</Label>
        <Input
          id="title"
          placeholder="Digite o nome da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-required="true"
        />
      </div>

      {/* Campo Descrição */}
      <div className="grid gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes da tarefa (opcional)"
          className="min-h-[80px]" // Reduzido um pouco
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Campo Prioridade */}
      <div className="grid gap-1.5">
        <Label>Prioridade</Label>
        <RadioGroup
          value={priority}
          onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}
          className="flex space-x-4" // Aumentado espaço entre opções
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="p-low" /> {/* IDs únicos */}
            <Label htmlFor="p-low" className="text-sm font-normal cursor-pointer">Baixa</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="p-medium" />
            <Label htmlFor="p-medium" className="text-sm font-normal cursor-pointer">Média</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="p-high" />
            <Label htmlFor="p-high" className="text-sm font-normal cursor-pointer">Alta</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Seção de Atividades */}
      <div className="grid gap-2 border-t pt-4"> {/* Separador visual */}
        <Label htmlFor="activity">Atividades (Subtarefas)</Label>
        {/* Input e Botão Adicionar */}
        <div className="flex gap-2">
          <Input
            id="activity"
            placeholder="Nova atividade..."
            value={newActivityText}
            onChange={(e) => setNewActivityText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(); }}}
          />
          <Button type="button" onClick={handleAddActivity} variant="outline" size="sm">
            Adicionar
          </Button>
        </div>
        {/* Lista de Atividades Adicionadas */}
        {activities.length > 0 && (
          <div className="mt-2 max-h-36 overflow-y-auto rounded-md border p-2 space-y-1"> {/* Scroll e borda */}
            <ul className="space-y-1 text-sm">
              {activities.map((activity, index) => (
                <li key={index} className="flex justify-between items-center group hover:bg-muted/50 px-1 rounded"> {/* Hover sutil */}
                  <span className="flex-1 mr-2 truncate py-0.5" title={activity.text}>{activity.text}</span>
                  <Button
                    type="button"
                    onClick={() => handleRemoveActivity(index)}
                    variant="ghost"
                    size="icon" // Botão de ícone
                    className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity" // Menor, com hover e opacidade
                    title="Remover atividade"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Botão de Submissão */}
      <Button type="submit" disabled={isSubmitting || !user} className="w-full mt-2">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          isEditing ? 'Atualizar Tarefa' : 'Salvar Tarefa' // Texto dinâmico
        )}
      </Button>
       {/* Mensagem se não estiver logado */}
       {!user && <p className="text-xs text-destructive text-center mt-1">Você precisa estar logado para salvar.</p>}
    </form>
  );
}