import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        // Vérification de la session admin
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("admin_session")?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session || session.expiresAt <= new Date()) {
            return NextResponse.json(
                { error: "Session invalide ou expirée" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Recherche du véhicule
        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id,
            },
        });

        if (!vehicule) {
            return NextResponse.json(
                { error: "Véhicule introuvable" },
                { status: 404 }
            );
        }

        // Un véhicule bloqué ne peut pas afficher cet historique
        if (vehicule.bloquage !== "Non") {
            return NextResponse.json(
                { error: "Ce véhicule est bloqué" },
                { status: 403 }
            );
        }

        // Historique
        const indisponibilites =
            await prisma.indisponibilite.findMany({
                where: {
                    id_vehicule: id,
                },
                orderBy: {
                    debut_indisponibilite: "desc",
                },
            });

        return NextResponse.json(indisponibilites);
    } catch (error) {
        console.error(
            "GET_INDISPONIBILITES_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error: "Impossible de récupérer l'historique",
            },
            { status: 500 }
        );
    }
}