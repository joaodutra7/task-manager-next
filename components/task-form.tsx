"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { db } from "../lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { useAuth } from "@/hooks/useAuth"; 
import { toast } from "sonner"; 

// Definir tipo para uma atividade
interface Activity {
  text: string;
  completed: boolean;
}

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  // Hook para obter o usuário atual
  const { user } = useAuth();
  console.log("Usuário autenticado:", user); // Verificar se o usuário está logado

  // Estados do formulário
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivityText, setNewActivityText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para adicionar atividade
  const handleAddActivity = () => {
    if (newActivityText.trim() !== "") {
      setActivities([
        ...activities,
        { text: newActivityText.trim(), completed: false },
      ]);
      setNewActivityText(""); // Limpar input da atividade
    }
  };

  // Função para remover atividade (opcional)
  const handleRemoveActivity = (indexToRemove: number) => {
    setActivities(activities.filter((_, index) => index !== indexToRemove));
  };

  // Função de submissão do formulário
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevenir recarregamento da página
    setIsSubmitting(true);

    // Verificar se usuário está logado
    if (!user) {
      console.error("Usuário não autenticado.");
      toast.error("Você precisa estar logado para criar tarefas."); // Exemplo com sonner
      setIsSubmitting(false);
      return;
    }

    // Verificar se o título foi preenchido
    if (!title.trim()) {
        console.error("O título da tarefa é obrigatório.");
        toast.error("O título da tarefa é obrigatório.");
        setIsSubmitting(false);
        return;
    }

    try {
      // Referência para a coleção 'tasks' no Firestore
      const tasksCollectionRef = collection(db, "tasks");

      // Dados da nova tarefa
      const newTask = {
        title,
        description,
        priority,
        userId: user.uid, // Vincular ao usuário logado
        createdAt: serverTimestamp(), // Usar timestamp do servidor
        activities, // Incluir lista de atividades
        status: "pending", // Status inicial
      };

      // Adicionar o documento ao Firestore
      await addDoc(tasksCollectionRef, newTask);

      console.log("Tarefa adicionada com sucesso!");
      toast.success("Tarefa criada com sucesso!"); // Exemplo com sonner

      // Limpar o formulário após sucesso
      setTitle("");
      setDescription("");
      setPriority("medium");
      setActivities([]);
      setNewActivityText("");

      // Chamar callback de sucesso, se fornecido (ex: fechar modal)
      onSuccess?.();

    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
      toast.error("Erro ao criar tarefa. Tente novamente."); // Exemplo com sonner
    } finally {
      setIsSubmitting(false); // Finalizar estado de submissão
    }
  };

  return (
    <form id="task-form" onSubmit={handleSubmit} className="grid gap-4 py-4">
      {/* Título */}
      <div className="grid gap-2">
        <Label htmlFor="title">Nome</Label>
        <Input
          id="title"
          placeholder="Digite o nome da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Descrição */}
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes da tarefa"
          className="min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Prioridade */}
      <div className="grid gap-2">
        <Label>Prioridade</Label>
        <RadioGroup
          value={priority}
          onValueChange={(value: "low" | "medium" | "high") =>
            setPriority(value)
          }
          className="flex"
        >
          {/* Opções Low, Medium, High (igual ao seu original) */}
           <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low" className="text-sm font-normal">
              Baixa
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium" className="text-sm font-normal">
              Média
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high" className="text-sm font-normal">
              Alta
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Gerenciamento de Atividades */}
      <div className="grid gap-2">
        <Label htmlFor="activity">Atividades (Subtarefas)</Label>
        <div className="flex gap-2">
          <Input
            id="activity"
            placeholder="Digite uma atividade e clique em Adicionar"
            value={newActivityText}
            onChange={(e) => setNewActivityText(e.target.value)}
            // Adiciona atividade ao pressionar Enter
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddActivity(); }}}
          />
          <Button type="button" onClick={handleAddActivity} variant="outline">
            Adicionar
          </Button>
        </div>
        {/* Lista de Atividades Adicionadas */}
        {activities.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
            {activities.map((activity, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{activity.text}</span>
                <Button
                  type="button"
                  onClick={() => handleRemoveActivity(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botão de Submissão */}
      <Button type="submit" disabled={isSubmitting || !user}>
        {isSubmitting ? "Salvando..." : "Salvar Tarefa"}
      </Button>
       {!user && <p className="text-xs text-red-600 text-center">Você precisa estar logado para salvar.</p>}
    </form>
  );
}