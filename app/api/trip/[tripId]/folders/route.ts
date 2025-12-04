import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { tripId } = await params

        const supabase = await createClient()

        // Verify membership
        const { data: membership } = await supabase
            .from("trip_members")
            .select("status")
            .eq("trip_id", tripId)
            .eq("user_id", session.id)
            .single()

        const { data: trip } = await supabase
            .from("trips")
            .select("owner_id")
            .eq("id", tripId)
            .single()

        if (!trip || (trip.owner_id !== session.id && membership?.status !== "approved")) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { data: folders, error } = await supabase
            .from("folders")
            .select("*")
            .eq("trip_id", tripId)
            .order("created_at", { ascending: true })

        if (error) {
            return new NextResponse("Failed to fetch folders", { status: 500 })
        }

        return NextResponse.json(folders)
    } catch (error) {
        console.error("Fetch folders error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ tripId: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { tripId } = await params
        const { name } = await request.json()

        if (!name) {
            return new NextResponse("Folder name is required", { status: 400 })
        }

        const supabase = await createClient()

        // Verify membership
        const { data: membership } = await supabase
            .from("trip_members")
            .select("status")
            .eq("trip_id", tripId)
            .eq("user_id", session.id)
            .single()

        const { data: trip } = await supabase
            .from("trips")
            .select("owner_id")
            .eq("id", tripId)
            .single()

        if (!trip || (trip.owner_id !== session.id && membership?.status !== "approved")) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { data: folder, error } = await supabase
            .from("folders")
            .insert({
                trip_id: tripId,
                name: name,
            })
            .select()
            .single()

        if (error) {
            console.error("Supabase insert error:", error)
            return new NextResponse(`Failed to create folder: ${error.message}`, { status: 500 })
        }

        return NextResponse.json(folder)
    } catch (error) {
        console.error("Create folder error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
