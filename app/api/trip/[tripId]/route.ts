import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = await createClient()
    const { tripId } = params
    const json = await request.json()
    const { name, description, is_public, auto_approve_members } = json

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is owner
    const { data: trip } = await supabase.from("trips").select("owner_id").eq("id", tripId).single()

    if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (trip.owner_id !== user.id) {
        return NextResponse.json({ error: "Only the owner can update trip settings" }, { status: 403 })
    }

    const { error } = await supabase
        .from("trips")
        .update({
            name,
            description,
            is_public,
            auto_approve_members,
            updated_at: new Date().toISOString(),
        })
        .eq("id", tripId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { tripId: string } }) {
    const supabase = await createClient()
    const { tripId } = params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is owner
    const { data: trip } = await supabase.from("trips").select("owner_id").eq("id", tripId).single()

    if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    if (trip.owner_id !== user.id) {
        return NextResponse.json({ error: "Only the owner can delete the trip" }, { status: 403 })
    }

    const { error } = await supabase.from("trips").delete().eq("id", tripId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
