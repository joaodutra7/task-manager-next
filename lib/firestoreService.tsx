// lib/firestoreService.ts
import { db } from "../lib/firebaseConfig"; 

  import {
    collection,
    query,
    where,
    onSnapshot, // Para ouvir atualizações em tempo real
    orderBy, // Para ordenar as tarefas
    doc,
    deleteDoc,
    Timestamp, // Tipo para datas do Firestore
    getDocs, // Alternativa para buscar uma vez
    addDoc,
    serverTimestamp,
    updateDoc
  } from "firebase/firestore";

  import { User } from "firebase/auth";
  
  // Atividade (subtarefa)
  interface Activity {
    text: string;
    completed: boolean;
  }
  
  // Interface Tarefa
  export interface Task {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    userId: string;
    createdAt: Timestamp;
    activities: Activity[];
    status: "pending" | "in_progress" | "completed";
  }
  
  // --- FUNÇÃO PARA OUVIR TAREFAS DO USUÁRIO (REAL-TIME) ---
  export const listenToUserTasks = (
    userId: string,
    callback: (tasks: Task[]) => void, // Função chamada quando os dados mudam
    onError: (error: Error) => void
  ): (() => void) => { // Retorna a função de 'unsubscribe'
    
    if (!userId) {
      onError(new Error("User ID is required to listen for tasks."));
      return () => {}; // Retorna uma função vazia se não houver ID
    }
  
    const tasksCollectionRef = collection(db, "tasks");
  
    // Cria a query: busca tarefas onde 'userId' é igual ao ID fornecido
    const q = query(
      tasksCollectionRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // Ordena pelas mais recentes
    );
  
    // onSnapshot ouve mudanças em tempo real
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const tasksData: Task[] = [];
        querySnapshot.forEach((doc) => {
          tasksData.push({ id: doc.id, ...doc.data() } as Task);
        });
        callback(tasksData); // Envia os dados atualizados para o callback
      },
      (error) => { // Callback de erro do onSnapshot
        console.error("Erro ao ouvir tarefas:", error);
        onError(error); // Chama o callback de erro fornecido
      }
    );
    return unsubscribe;
  };
  
  
  // --- FUNÇÃO PARA DELETAR UMA TAREFA ---
  export const deleteTask = async (taskId: string): Promise<void> => {
    if (!taskId) {
      throw new Error("Task ID is required to delete a task.");
    }
    try {
      const taskDocRef = doc(db, "tasks", taskId);
      await deleteDoc(taskDocRef);
      console.log("Tarefa deletada com sucesso:", taskId);
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
      throw new Error("Falha ao deletar a tarefa.");
    }
  };
  
  // --- FUNÇÃO PARA ATUALIZAR UMA TAREFA ---
  export const updateTask = async (taskId: string, dataToUpdate: Partial<Task>): Promise<void> => {
     if (!taskId) {
      throw new Error("Task ID is required to update a task.");
    }
    try {
      const taskDocRef = doc(db, "tasks", taskId);
      await updateDoc(taskDocRef, dataToUpdate);
       console.log("Tarefa atualizada com sucesso:", taskId);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      throw new Error("Falha ao atualizar a tarefa.");
    }
  }
  
  // --- FUNÇÃO PARA CRIAR UMA TAREFA ---
  export const createTask = async (
    taskData: Omit<Task, 'id' | 'createdAt'> // Dados sem id e createdAt
  ): Promise<string> => { // Retorna o ID da nova tarefa
    try {
      const tasksCollectionRef = collection(db, "tasks");
      const newTaskData = {
        ...taskData,
        createdAt: serverTimestamp(), // Adiciona timestamp do servidor
      };
      const docRef = await addDoc(tasksCollectionRef, newTaskData);
      console.log("Tarefa criada com sucesso com ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      throw new Error("Falha ao criar a tarefa.");
    }
  };