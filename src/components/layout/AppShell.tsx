import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
