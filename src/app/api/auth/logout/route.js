import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const sessionId = request.cookies.get("admin_session")?.value;

        if (sessionId) {
            await prisma.session.deleteMany({
                where: {
                    id: sessionId,
                },
            });
        }

        const response = NextResponse.json({
            message: "Déconnexion réussie",
        });

        response.cookies.delete("admin_session");

        return response;
    } catch (error) {
        console.error("LOGOUT_ERROR:", error);

        return NextResponse.json(
            {
                error: "Une erreur est survenue",
            },
            {
                status: 500,
            }
        );
    }
}
