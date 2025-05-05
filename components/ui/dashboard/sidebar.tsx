"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  ChevronLeft,
  ClipboardCheck,
  Home,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner";     
import { auth } from "@/lib/firebaseConfig"
import { signOut } from "firebase/auth"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  // Função de Logout (idêntica à do DashboardPage)
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logout realizado com sucesso!");
      // A navegação será tratada pelo listener de autenticação (useAuth -> useEffect)
      // Não é necessário router.push('/') aqui.
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao tentar sair. Tente novamente.");
    }
  };

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ]

   const logoutItem = {
     id: 'logout',
     title: "Logout",
     icon: <LogOut className="h-5 w-5" />,
     action: handleLogout, // Associando a função de logout
   };


  return (
    <div className={cn("relative flex flex-col border-r bg-background h-screen", className)}> {/* Garante altura total */}
      {/* Header da Sidebar */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b"> {/* shrink-0 */}
         <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 mr-2"> {/* flex-shrink-0 mr-2 */}
          <ClipboardCheck className="h-6 w-6" />
          {!collapsed && <span className="text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis">GerenciaTask</span>} {/* Ajuste de texto */}
        </Link>
        {/* Botão de Colapsar/Expandir */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto" // Usa ml-auto para empurrar para a direita
          onClick={() => setCollapsed(!collapsed)}
        >
          {/* Ícone muda baseado no estado collapsed */}
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      {/* Navegação Principal (ocupa espaço restante) */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {mainNavItems.map((item, index) => (
            <Link
              key={item.href || index} // Use href como chave se for único
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground", // Melhor contraste para inativos
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.title : undefined} // Tooltip quando colapsado
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Navegação Secundária (na parte inferior) */}
      <div className="border-t py-4 shrink-0"> {/* shrink-0 */}
        <nav className="grid gap-1 px-2">
          {/* Renderiza o Botão de Logout */}
          <Button
            variant="ghost" // Usa ghost para ter fundo transparente, hover é definido no className
            className={cn(
              "flex w-full items-center gap-3 justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground", // Estilo base similar aos links inativos
              collapsed && "justify-center px-2"
            )}
            onClick={logoutItem.action} // Chama a função de logout
            title={collapsed ? logoutItem.title : undefined}
          >
            {logoutItem.icon}
            {!collapsed && <span>{logoutItem.title}</span>}
          </Button>
        </nav>
      </div>
    </div>
  )
}