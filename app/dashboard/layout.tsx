import { Header } from "@/components/ui/dashboard/header"
import { Sidebar } from "@/components/ui/dashboard/sidebar"
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar className="hidden lg:block" />
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  )
}