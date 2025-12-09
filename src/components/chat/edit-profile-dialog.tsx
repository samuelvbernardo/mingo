"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
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
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar"
import { Settings } from "lucide-react"
import type { IUserDTO } from "@/models/user/user.types"

interface EditProfileDialogProps {
  onProfileUpdated?: (user: IUserDTO) => void
}

export function EditProfileDialog({ onProfileUpdated }: EditProfileDialogProps) {
  const { data: session, update } = useSession()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [avatarPreview, setAvatarPreview] = useState<string>(session?.user?.image || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      let avatarUrl = session?.user?.image

      // Upload avatar se houver arquivo novo
      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)

        const uploadResponse = await fetch("/api/user/upload-avatar", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          avatarUrl = uploadData.url
        } else {
          alert("Erro ao fazer upload da foto")
          return
        }
      }

      // Atualizar informações do usuário
      const response = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatar: avatarUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            image: data.user.avatar,
          },
        })
        onProfileUpdated?.(data.user)
        setOpen(false)
      } else {
        alert("Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      alert("Erro ao salvar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>Atualize suas informações pessoais e foto de perfil</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <img
                src={avatarPreview || `/placeholder.svg?height=96&width=96&query=${name}`}
                alt={name}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
              >
                Alterar Foto
              </Button>
              {avatarFile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAvatarFile(null)
                    setAvatarPreview(session?.user?.image || "")
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Formatos suportados: JPG, PNG, GIF (máx. 5MB)
            </p>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email não pode ser alterado
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setName(session?.user?.name || "")
                setAvatarPreview(session?.user?.image || "")
                setAvatarFile(null)
              }}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
