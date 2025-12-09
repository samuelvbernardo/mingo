import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { UserService } from "@/models/user/user.service"
import { getServerSession } from "@/lib/auth/auth"

export async function GET() {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const users = await UserService.getOnlineUsers()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[ONLINE_USERS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
