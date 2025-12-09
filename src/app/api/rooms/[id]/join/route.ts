import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { RoomService } from "@/models/room/room.service"
import { getServerSession } from "@/lib/auth/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const room = await RoomService.addMember(id, session.user.id)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({ room })
  } catch (error: any) {
    console.error("[ROOM_JOIN_ERROR]", error)

    if (error.message === "Room is full") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
