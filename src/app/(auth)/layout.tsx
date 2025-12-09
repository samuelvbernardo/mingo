import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Mingo - Entrar ou Registrar",
  description: "Acesse sua conta Mingo ou crie uma nova para começar a conversar em tempo real.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
            <Image 
              src="/logo-mingo.png" 
              alt="Mingo Logo" 
              width={32} 
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-xl font-bold text-black dark:text-white">Mingo</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2025 Mingo - Chat em Tempo Real
        </div>
      </footer>
    </div>
  )
}

