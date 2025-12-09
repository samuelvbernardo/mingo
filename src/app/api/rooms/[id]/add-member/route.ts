import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { RoomService } from "@/models/room/room.service"
import { getServerSession } from "@/lib/auth/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    await connectDB()

    const room = await RoomService.findById(id)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Verificar se o usuário que está adicionando é o criador da sala
    if (room.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Only room creator can add members" }, { status: 403 })
    }

    const updatedRoom = await RoomService.addMember(id, userId)

    if (!updatedRoom) {
      return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
    }

    return NextResponse.json({ room: updatedRoom }, { status: 200 })
  } catch (error: any) {
    console.error("[ADD_MEMBER_ERROR]", error)
    
    if (error.message === "Room is full") {
      return NextResponse.json({ error: "Room is full" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
