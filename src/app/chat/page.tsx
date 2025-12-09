"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { RoomList } from "@/components/chat/room-list"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { CreateRoomDialog } from "@/components/chat/create-room-dialog"
import { AddMemberDialog } from "@/components/chat/add-member-dialog"
import { DeleteRoomDialog } from "@/components/chat/delete-room-dialog"
import { EditProfileDialog } from "@/components/chat/edit-profile-dialog"
import { Button } from "@/components/ui/button"
import { usePusher } from "@/hooks/use-pusher"
import type { IRoomDTO } from "@/models/room/room.types"
import type { IMessageDTO } from "@/models/message/message.types"
import { LogOut, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"

// Event names for Pusher real-time communication
const EVENTS = {
  MESSAGE_NEW: "MESSAGE_NEW",
  TYPING: "TYPING",
} as const

// Types for event payloads
interface MessagePayload {
  roomId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type?: string
  timestamp: number
}

interface TypingPayload {
  roomId: string
  userId: string
  userName: string
  isTyping: boolean
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rooms, setRooms] = useState<IRoomDTO[]>([])
  const [currentRoom, setCurrentRoom] = useState<IRoomDTO | null>(null)
  const [messages, setMessages] = useState<IMessageDTO[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [replyingTo, setReplyingTo] = useState<IMessageDTO | null>(null)

  const pusherChannel = usePusher(currentRoom ? `room-${currentRoom.id}` : "")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    loadRooms()
  }, [])

  useEffect(() => {
    if (!pusherChannel || !currentRoom) return

    const handleNewMessage = (data: MessagePayload) => {
      console.log("[v0] Pusher message received:", data)
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.roomId)) return prev
        return [
          ...prev,
          {
            id: data.roomId + data.timestamp,
            roomId: data.roomId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            content: data.content,
            type: data.type || "text",
            readBy: [],
            isEdited: false,
            createdAt: new Date(data.timestamp),
            updatedAt: new Date(data.timestamp),
          } as IMessageDTO,
        ]
      })
    }

    const handleMessageUpdated = (data: IMessageDTO) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.id ? data : msg))
      )
    }

    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
    }

    const handleTyping = (data: TypingPayload) => {
      if (data.userId === session?.user?.id) return

      if (data.isTyping) {
        setTypingUsers((prev) => (prev.includes(data.userName) ? prev : [...prev, data.userName]))
      } else {
        setTypingUsers((prev) => prev.filter((name) => name !== data.userName))
      }
    }

    pusherChannel.bind(EVENTS.MESSAGE_NEW, handleNewMessage)
    pusherChannel.bind(EVENTS.TYPING, handleTyping)
    pusherChannel.bind("MESSAGE_UPDATED", handleMessageUpdated)
    pusherChannel.bind("MESSAGE_DELETED", handleMessageDeleted)

    return () => {
      pusherChannel.unbind(EVENTS.MESSAGE_NEW, handleNewMessage)
      pusherChannel.unbind(EVENTS.TYPING, handleTyping)
      pusherChannel.unbind("MESSAGE_UPDATED", handleMessageUpdated)
      pusherChannel.unbind("MESSAGE_DELETED", handleMessageDeleted)
    }
    }, [pusherChannel, currentRoom, session?.user?.id])

  const loadRooms = async () => {
    try {
      setIsLoadingRooms(true)
      const response = await fetch("/api/rooms")
      const data = await response.json()
      setRooms(data.rooms)
    } catch (error) {
      console.error("Falha ao carregar salas:", error)
    } finally {
      setIsLoadingRooms(false)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch(`/api/messages/${roomId}`)
      const data = await response.json()
      setMessages(data.messages)
    } catch (error) {
      console.error("Falha ao carregar mensagens:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleRoomSelect = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    if (!room.members.includes(session?.user?.id || "")) {
      await joinRoom(roomId)
    }

    setCurrentRoom(room)
    await loadMessages(roomId)
    setSidebarOpen(false)
  }

  const joinRoom = async (roomId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/join`, { method: "POST" })
      if (response.ok) {
        await loadRooms()
      }
    } catch (error) {
      console.error("Falha ao entrar na sala:", error)
    }
  }

  const handleCreateRoom = async (data: {
    name: string
    description?: string
    isPrivate: boolean
    maxMembers?: number
  }) => {
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await loadRooms()
      }
    } catch (error) {
      console.error("Falha ao criar sala:", error)
      throw error
    }
  }

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentRoom || !session?.user) return

      try {
        const response = await fetch(`/api/messages/${currentRoom.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            content,
            replyTo: replyingTo?.id || undefined,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMessages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            data.message as IMessageDTO,
          ])
          // Limpar estado de resposta após enviar
          setReplyingTo(null)
        }
      } catch (error) {
        console.error("Falha ao enviar mensagem:", error)
      }
    },
    [currentRoom, session?.user, replyingTo],
  )

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Image 
            src="/logo-mingo.png" 
            alt="Mingo Logo" 
            width={32} 
            height={32}
            className="h-8 w-8 rounded-full"
          />
          <h1 className="text-lg font-bold">Mingo</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Bem-vindo, {session?.user?.name}</span>
          <EditProfileDialog />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-20 w-80 h-full lg:h-auto border-r bg-card transition-transform duration-200`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <CreateRoomDialog onCreateRoom={handleCreateRoom} />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Salas Disponíveis</h2>
              <RoomList
                rooms={rooms}
                currentRoomId={currentRoom?.id}
                onRoomSelect={handleRoomSelect}
                isLoading={isLoadingRooms}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentRoom ? (
            <>
              <div className="border-b px-4 py-3 bg-card flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-balance">{currentRoom.name}</h2>
                  {currentRoom.description && <p className="text-sm text-muted-foreground">{currentRoom.description}</p>}
                </div>
                {currentRoom.createdBy === session?.user?.id && (
                  <div className="flex items-center gap-2">
                    <AddMemberDialog
                      room={currentRoom}
                      onMemberAdded={(updatedRoom) => setCurrentRoom(updatedRoom)}
                    />
                    <DeleteRoomDialog
                      room={currentRoom}
                      onRoomDeleted={() => {
                        setCurrentRoom(null)
                        loadRooms()
                      }}
                    />
                  </div>
                )}
              </div>

              <MessageList
                messages={messages}
                currentUserId={session?.user?.id || ""}
                isLoading={isLoadingMessages}
                roomId={currentRoom?.id}
                onMessageUpdate={() => currentRoom?.id && loadMessages(currentRoom.id)}
                onReplyMessage={(messageId) => {
                  const repliedMessage = messages?.find((m) => m.id === messageId)
                  if (repliedMessage) {
                    setReplyingTo(repliedMessage)
                  }
                }}
              />
              <TypingIndicator userNames={typingUsers} />

              <MessageInput 
                onSend={handleSendMessage} 
                disabled={!currentRoom}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">Selecione uma sala para começar a conversar</p>
                <p className="text-sm">Escolha das salas disponíveis ou crie uma nova</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
