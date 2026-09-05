import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("admin_session")?.value;

        const vehicles = await prisma.vehicule.findMany({
            orderBy: {
                designation: "asc",
            },
        });

        return NextResponse.json(vehicles);
    } catch (error) {
        console.error("GET_VEHICULES_ERROR:", error);

        return NextResponse.json(
            {
                error: "Impossible de récupérer les véhicules",
            },
            { status: 500 }
        );
    }
}
