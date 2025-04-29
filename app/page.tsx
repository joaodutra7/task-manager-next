import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { CalendarIcon, CheckCircle, ClipboardCheck, ListTodo } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            <span className="text-xl font-bold">Gerencia Essa P0$$#</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Registrar-se</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-24 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Gerencia Essa P0$$#
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Ferramenta simples e eficaz para organizar suas tarefas diárias e aumentar sua produtividade.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="w-full min-[400px]:w-auto">Começar</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg border bg-card p-8 shadow-lg">
              <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <div className="h-2 w-full rounded-full bg-primary/20">
                    <div className="h-full w-3/4 rounded-full bg-primary"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[
                    "Preparar Projeto",
                    "Revisar Código",
                    "Enviar Relatório",
                  ].map((task, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border bg-background p-3">
                      <div className={`h-4 w-4 rounded-full ${i === 0 ? "bg-destructive" : i === 1 ? "bg-amber-500" : "bg-primary"}`}></div>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      
        <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Funcionalidades
              </h2>
              <p className="max-w-[85%] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Tudo que você precisa para gerenciar suas tarefas de forma eficiente.
              </p>
            </div>
            
            <div className="mx-auto grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-2 lg:gap-12">
              {[
                {
                  icon: <ListTodo className="h-10 w-10" />,
                  title: "Organização de Tarefas",
                  description: "Crie, edite e organize suas tarefas em listas personalizadas. Mantenha tudo em ordem e nunca perca um prazo.",
                },
                {
                  icon: <CheckCircle className="h-10 w-10" />,
                  title: "Rastreio de Progresso",
                  description: "Acompanhe o progresso de suas tarefas com indicadores visuais. Veja rapidamente o que está pendente e o que já foi concluído.",
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 text-center shadow-sm">
                  <div className="text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t bg-muted/50">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-10 sm:px-6 md:h-24 md:flex-row md:py-0 lg:px-8">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">
              © 2025 Gerencia Essa P0$$#. Todos os direitos Reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}