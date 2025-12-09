"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { IRoomDTO } from "@/models/room/room.types"

interface DeleteRoomDialogProps {
  room: IRoomDTO
  onRoomDeleted?: () => void
}

export function DeleteRoomDialog({ room, onRoomDeleted }: DeleteRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setOpen(false)
        onRoomDeleted?.()
      } else {
        alert("Erro ao excluir a sala")
      }
    } catch (error) {
      console.error("Erro ao excluir sala:", error)
      alert("Erro ao excluir a sala")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          Deletar Sala
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Sala</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a sala <strong>"{room.name}"</strong>? Essa ação não pode ser desfeita e todos os históricos de mensagens serão perdidos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            {isDeleting ? "Excluindo..." : "Sim, Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
