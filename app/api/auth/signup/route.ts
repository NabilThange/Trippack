import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 })
    }

    // Create user with password
    const { data: newUser, error } = await supabase
      .from("profiles")
      .insert({
        username: username.trim(),
        password_hash: password,
      })
      .select("id, username")
      .single()

    if (error) {
      console.error("Signup error:", error)
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    const response = NextResponse.json({
      user: { id: newUser.id, username: newUser.username },
    })

    response.cookies.set("trippack_session", JSON.stringify({ id: newUser.id, username: newUser.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
