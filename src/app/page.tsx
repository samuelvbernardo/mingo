import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo-mingo.png" 
              alt="Mingo Logo" 
              width={40} 
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-black dark:text-white">Mingo</h1>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registre-se</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Conecte-se em Tempo Real</h2>
          <p className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto">
            Experimente comunicação perfeita com mensagens instantâneas em tempo real. Junte-se a salas,
            converse com amigos e mantenha-se conectado.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Button size="lg" asChild>
              <Link href="/register">Começar</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Mensagens Instantâneas</h3>
              <p className="text-sm text-muted-foreground">Entrega de mensagens em tempo real com latência ultra-baixa</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Múltiplas Salas</h3>
              <p className="text-sm text-muted-foreground">Crie e junte-se a salas para diferentes tópicos</p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Indicadores de Digitação</h3>
              <p className="text-sm text-muted-foreground">Veja quando outros estão digitando em tempo real</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">Mingo - Chat em Tempo Real</p>
          <p>Construído com Next.js, MongoDB e Pusher | © 2025</p>
        </div>
      </footer>
    </div>
  )
}
