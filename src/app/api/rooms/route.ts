import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { RoomService } from "@/models/room/room.service"
import { getServerSession } from "@/lib/auth/auth"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const rooms = await RoomService.findByUserId(session.user.id)

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error("[ROOMS_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isPrivate, maxMembers } = body

    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 })
    }

    await connectDB()

    const room = await RoomService.createRoom({
      name,
      description,
      isPrivate: isPrivate || false,
      maxMembers,
      createdBy: session.user.id,
    })

    return NextResponse.json({ room }, { status: 201 })
  } catch (error) {
    console.error("[ROOMS_POST_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
