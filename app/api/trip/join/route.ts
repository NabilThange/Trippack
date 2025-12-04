import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { tripId } = await request.json()
        if (!tripId) {
            return new NextResponse("Trip ID is required", { status: 400 })
        }

        const supabase = await createClient()

        // Get trip details to check auto_approve setting
        const { data: trip, error: tripError } = await supabase
            .from("trips")
            .select("auto_approve_members")
            .eq("id", tripId)
            .single()

        if (tripError || !trip) {
            return new NextResponse("Trip not found", { status: 404 })
        }

        const status = trip.auto_approve_members ? "approved" : "pending"

        // Insert new member
        const { error: insertError } = await supabase.from("trip_members").insert({
            trip_id: tripId,
            user_id: session.id,
            status: status,
        })

        if (insertError) {
            // Check for duplicate key error (already joined)
            if (insertError.code === "23505") {
                return new NextResponse("Already a member", { status: 409 })
            }
            return new NextResponse("Failed to join trip", { status: 500 })
        }

        return NextResponse.json({ status })
    } catch (error) {
        console.error("Join trip error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
