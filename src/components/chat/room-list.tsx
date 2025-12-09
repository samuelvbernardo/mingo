"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { IRoomDTO } from "@/models/room/room.types"
import { Users, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomListProps {
  rooms: IRoomDTO[]
  currentRoomId?: string
  onRoomSelect: (roomId: string) => void
  isLoading?: boolean
}

export function RoomList({ rooms, currentRoomId, onRoomSelect, isLoading }: RoomListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Nenhuma sala disponível. Crie uma para começar!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <Card
          key={room.id}
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            currentRoomId === room.id && "bg-muted border-primary",
          )}
          onClick={() => onRoomSelect(room.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{room.name}</h3>
                  {room.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                </div>
                {room.description && <p className="text-xs text-muted-foreground line-clamp-2">{room.description}</p>}
              </div>

              <Badge variant="secondary" className="shrink-0">
                <Users className="h-3 w-3 mr-1" />
                {room.memberCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
