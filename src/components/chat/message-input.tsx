"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, X } from "lucide-react"
import type { IMessageDTO } from "@/models/message/message.types"

interface MessageInputProps {
  onSend: (content: string) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  disabled?: boolean
  replyingTo?: IMessageDTO | null
  onCancelReply?: () => void
}

export function MessageInput({ onSend, onTypingStart, onTypingStop, disabled, replyingTo, onCancelReply }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleTyping = useCallback(() => {
    if (!isTyping && onTypingStart) {
      setIsTyping(true)
      onTypingStart()
    }
  }, [isTyping, onTypingStart])

  const handleStopTyping = useCallback(() => {
    if (isTyping && onTypingStop) {
      setIsTyping(false)
      onTypingStop()
    }
  }, [isTyping, onTypingStop])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || disabled) return

    onSend(message.trim())
    setMessage("")
    handleStopTyping()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4 space-y-2">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Respondendo a {replyingTo.userName}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{replyingTo.content}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
            className="h-6 w-6 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            handleTyping()
          }}
          onBlur={handleStopTyping}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          disabled={disabled}
          className="min-h-[60px] resize-none"
        />
        <Button type="submit" size="icon" disabled={!message.trim() || disabled} className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
