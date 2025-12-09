import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File is too large" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Gerar nome único
    const timestamp = Date.now()
    const extension = file.type.split("/")[1] || "jpg"
    const filename = `${session.user.id}-${timestamp}.${extension}`

    // Caminho da pasta public/avatars
    const uploadDir = join(process.cwd(), "public", "avatars")
    const filepath = join(uploadDir, filename)

    // Criar pasta se não existir
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Pasta já existe
    }

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // Retornar URL da imagem
    const url = `/avatars/${filename}`

    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    console.error("[UPLOAD_AVATAR_ERROR]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
