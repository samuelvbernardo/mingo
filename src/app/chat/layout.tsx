import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Mingo - Chat em Tempo Real",
  description: "Mingo: Conecte-se com amigos e converse em tempo real. Salas, mensagens instantâneas e indicadores de digitação.",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
