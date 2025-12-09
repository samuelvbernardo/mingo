"use client"

import { useState, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Search, X, Check } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import type { IUserDTO } from "@/models/user/user.types"
import type { IRoomDTO } from "@/models/room/room.types"

interface AddMemberDialogProps {
  room: IRoomDTO
  onMemberAdded?: (room: IRoomDTO) => void
}

export function AddMemberDialog({ room, onMemberAdded }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<IUserDTO[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [addedUsers, setAddedUsers] = useState<Set<string>>(new Set())
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)

      // Limpar timer anterior
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }

      if (!query.trim()) {
        setSearchResults([])
        return
      }

      // Debounce de 300ms
      debounceTimer.current = setTimeout(async () => {
        try {
          setIsSearching(true)
          const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`)
          const data = await response.json()
          setSearchResults(data.users || [])
        } catch (error) {
          console.error("Erro ao buscar usuários:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    [],
  )

  const handleAddMember = async (userId: string) => {
    try {
      setIsAdding(userId)
      const response = await fetch(`/api/rooms/${room.id}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setAddedUsers((prev) => new Set([...prev, userId]))
        onMemberAdded?.(data.room)
        
        // Remover o usuário dos resultados
        setSearchResults((prev) => prev.filter((u) => u.id !== userId))
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error)
      alert("Erro ao adicionar membro à sala")
    } finally {
      setIsAdding(null)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchQuery("")
      setSearchResults([])
      setAddedUsers(new Set())
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Membro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Membro à Sala</DialogTitle>
          <DialogDescription>Procure por um usuário para adicionar à sala {room.name}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Procure por nome ou email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                disabled={isSearching}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-2">
            {isSearching && searchQuery && (
              <p className="text-sm text-muted-foreground text-center py-8">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  Buscando...
                </div>
              </p>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-2">
                {searchResults.map((user) => {
                  const isMember = room.members.includes(user.id)
                  const isAdded = addedUsers.has(user.id)
                  const isLoading = isAdding === user.id

                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <img
                            src={`/placeholder.svg?height=32&width=32&query=${user.name}`}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={isMember || isLoading}
                        onClick={() => handleAddMember(user.id)}
                        variant={isAdded ? "default" : "outline"}
                        className="ml-2 shrink-0"
                      >
                        {isLoading ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : isAdded || isMember ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">Tente outro nome ou email</p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Digite um nome ou email para começar</p>
              </div>
            )}
          </div>

          {/* Info about current members */}
          {room.members.length > 1 && (
            <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
              <p className="font-medium mb-1">Membros atuais ({room.members.length})</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
