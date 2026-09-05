import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const chauffeurs = await prisma.chauffeur.findMany({
            orderBy: {
                nom: "asc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: chauffeurs,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors de la récupération des chauffeurs :", error);

        return NextResponse.json(
            {
                success: false,
                message: "Une erreur est survenue lors de la récupération des chauffeurs.",
            },
            { status: 500 }
        );
    }
}
