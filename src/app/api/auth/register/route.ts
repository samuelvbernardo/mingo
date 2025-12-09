import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db/mongoose"
import { UserService } from "@/models/user/user.service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await connectDB()

    const existingUser = await UserService.findByEmail(email)

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const user = await UserService.createUser({ name, email, password })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
