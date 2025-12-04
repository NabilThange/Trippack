import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, username, password_hash")
      .eq("username", username.trim())
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Simple password check (in production, use bcrypt or similar)
    if (user.password_hash !== password) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    const response = NextResponse.json({
      user: { id: user.id, username: user.username },
    })

    response.cookies.set("trippack_session", JSON.stringify({ id: user.id, username: user.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
