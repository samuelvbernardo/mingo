import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { UserService } from "@/models/user/user.service"
import { getServerSession } from "@/lib/auth/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    await connectDB()

    // Buscar usuários por email ou nome
    const users = await UserService.findByNameOrEmail(query, session.user.id)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[SEARCH_USERS_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
