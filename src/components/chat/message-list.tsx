"use client"

import { useState, useEffect, useRef } from "react"
import { MessageItem } from "./message-item"
import type { IMessageDTO } from "@/models/message/message.types"
import { Skeleton } from "@/components/ui/skeleton"

interface MessageListProps {
  messages?: IMessageDTO[] | null
  currentUserId: string
  isLoading?: boolean
  roomId?: string
  onMessageUpdate?: () => void
  onReplyMessage?: (messageId: string) => void
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  roomId,
  onMessageUpdate,
  onReplyMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSelectMessage = (messageId: string, selected: boolean) => {
    const newSelected = new Set(selectedMessages)
    if (selected) {
      newSelected.add(messageId)
    } else {
      newSelected.delete(messageId)
    }
    setSelectedMessages(newSelected)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!roomId) return

    try {
      const response = await fetch(`/api/messages/${roomId}/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSelectedMessages((prev) => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
        onMessageUpdate?.()
      }
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error)
      alert("Erro ao deletar mensagem")
    }
  }

  const handleEditMessage = async (messageId: string, content: string) => {
    if (!roomId) return

    try {
      const response = await fetch(`/api/messages/${roomId}/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        onMessageUpdate?.()
      }
    } catch (error) {
      console.error("Erro ao editar mensagem:", error)
      alert("Erro ao editar mensagem")
    }
  }

  const handleReplyMessage = (messageId: string) => {
    onReplyMessage?.(messageId)
  }

  if (!messages || !Array.isArray(messages)) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-center">Carregando...</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-center">Nenhuma mensagem ainda. Comece a conversa!</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {messages.map((message) => {
        const repliedMessage = message.replyTo ? messages.find((m) => m.id === message.replyTo) : null
        return (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={message.userId === currentUserId}
            onDelete={handleDeleteMessage}
            onEdit={handleEditMessage}
            onSelect={handleSelectMessage}
            onReply={handleReplyMessage}
            isSelected={selectedMessages.has(message.id)}
            showMenu={activeMenuMessageId === message.id}
            onToggleMenu={() => setActiveMenuMessageId(activeMenuMessageId === message.id ? null : message.id)}
            onCloseMenu={() => setActiveMenuMessageId(null)}
            repliedMessage={repliedMessage || null}
          />
        )
      })}
    </div>
  )
}