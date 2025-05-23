"use client"

import { Bell, Plus, Search } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { TaskForm } from "@/components/task-form"
import { useState } from "react"
import { auth } from "@/lib/firebaseConfig"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function Header() {

  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para fechar o modal, será passada para o TaskForm
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- FUNÇÃO DE LOGOUT ---
  const handleLogout = async () => {
    try {
      await signOut(auth); // Chama a função de logout do Firebase
      toast.success("Logout realizado com sucesso!");
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao tentar sair. Tente novamente.");
    }
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center justify-end gap-3">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Nova Tarefa</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Tarefa</DialogTitle>
              <DialogDescription>
                Adicionar uma nova tarefa à sua lista.
              </DialogDescription>
            </DialogHeader>
            <TaskForm onSuccess={handleCloseModal}/>
          </DialogContent>
        </Dialog>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}