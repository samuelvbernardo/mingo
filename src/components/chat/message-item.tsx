"use client"

import { useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { IMessageDTO } from "@/models/message/message.types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, Edit2, Copy, MoreVertical, Reply } from "lucide-react"

interface MessageItemProps {
  message: IMessageDTO
  isOwnMessage: boolean
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => void
  onSelect?: (messageId: string, selected: boolean) => void
  onReply?: (messageId: string) => void
  isSelected?: boolean
  showMenu?: boolean
  onToggleMenu?: () => void
  onCloseMenu?: () => void
  repliedMessage?: IMessageDTO | null
}

export function MessageItem({
  message,
  isOwnMessage,
  onDelete,
  onEdit,
  onSelect,
  onReply,
  isSelected = false,
  showMenu = false,
  onToggleMenu,
  onCloseMenu,
  repliedMessage,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(message.id)
      onCloseMenu?.()
    }
  }

  const handleSaveEdit = async () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent)
      setIsEditing(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    onCloseMenu?.()
  }

  const toggleMenu = () => {
    onToggleMenu?.()
  }

  const closeMenu = () => {
    onCloseMenu?.()
  }

  const handleReply = () => {
    if (onReply) {
      onReply(message.id)
      closeMenu()
    }
  }

  return (
    <div
      className={cn(
        "flex gap-3 py-2 px-4 group relative transition-colors",
        isOwnMessage && "flex-row-reverse",
        isSelected && "bg-blue-50 dark:bg-blue-950",
      )}
      onContextMenu={(e) => {
        e.preventDefault()
        toggleMenu()
      }}
    >

      <Avatar className="h-8 w-8 shrink-0">
        <img
          src={message.userAvatar || `/placeholder.svg?height=32&width=32&query=${message.userName}`}
          alt={message.userName || "User"}
          className="h-full w-full object-cover"
        />
      </Avatar>

      <div className={cn("flex flex-col max-w-[65%]", isOwnMessage && "items-end")}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn("text-sm font-medium", isOwnMessage && "order-2")}>{message.userName}</span>
          <span className={cn("text-xs text-muted-foreground", isOwnMessage && "order-1")}>
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
          </span>
          {message.isEdited && (
            <span className={cn("text-xs text-muted-foreground italic", isOwnMessage && "order-1")}>
              (editada)
            </span>
          )}
        </div>

        {/* Reply to indicator */}
        {message.replyTo && repliedMessage && (
          <div className="mb-2 pl-2 border-l-2 border-muted-foreground opacity-70">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              Respondendo a {repliedMessage.userName}
            </p>
            <p className="text-sm text-muted-foreground truncate line-clamp-2">
              {repliedMessage.content}
            </p>
          </div>
        )}

        {isEditing ? (
          <div className="flex gap-2 w-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 p-2 border rounded text-sm"
              rows={2}
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleSaveEdit} className="bg-green-500 hover:bg-green-600">
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg px-4 py-2 break-words relative group/message",
              isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <p className="text-sm leading-relaxed">{message.content}</p>

            {/* Action buttons on hover */}
            {isOwnMessage && (
              <div className="hidden group-hover/message:flex absolute -left-16 top-1/2 -translate-y-1/2 gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  title="Deletar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Context menu button for any message */}
            <Button
              size="sm"
              variant="ghost"
              className="hidden group-hover/message:flex h-6 w-6 p-0 absolute -right-10 top-1/2 -translate-y-1/2"
              onClick={(e) => {
                e.stopPropagation()
                toggleMenu()
              }}
              title="Mais opções"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Dropdown menu */}
        {showMenu && (
          <div
            className={cn(
              "absolute top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 min-w-max",
              isOwnMessage && "right-0",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Responder */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation()
                handleReply()
              }}
            >
              <Reply className="h-4 w-4 mr-2" />
              Responder
            </Button>

            {/* Copiar */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={(e) => {
                e.stopPropagation()
                handleCopy()
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>

            {/* Editar (apenas próprias mensagens) */}
            {isOwnMessage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                    closeMenu()
                  }}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>

                {/* Deletar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
