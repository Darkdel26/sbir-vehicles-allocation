import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
    try {
        // ==========================================
        // Protection du cron
        // ==========================================

        const authHeader = request.headers.get("authorization");

        if (
            authHeader !==
            `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Non autorisé",
                },
                { status: 401 }
            );
        }

        const maintenant = new Date();

        // ==========================================
        // 1. Récupération des véhicules
        // ==========================================

        const vehicules = await prisma.vehicule.findMany({
            select: {
                id: true,
                bloquage: true,
            },
        });

        // ==========================================
        // 2. Mise à jour des véhicules
        // ==========================================

        for (const vehicule of vehicules) {

            // ------------------------------------------
            // Un véhicule bloqué reste toujours
            // indisponible
            // ------------------------------------------

            if (vehicule.bloquage === "Oui") {
                await prisma.vehicule.update({
                    where: {
                        id: vehicule.id,
                    },
                    data: {
                        etat: "Indisponible",
                    },
                });

                continue;
            }

            // ------------------------------------------
            // Véhicule non bloqué :
            // recherche d'une indisponibilité en cours
            // ------------------------------------------

            const indisponibilite =
                await prisma.indisponibilite.findFirst({
                    where: {
                        id_vehicule: vehicule.id,

                        debut_indisponibilite: {
                            lte: maintenant,
                        },

                        fin_indisponibilite: {
                            gte: maintenant,
                        },
                    },
                });

            await prisma.vehicule.update({
                where: {
                    id: vehicule.id,
                },

                data: {
                    etat: indisponibilite
                        ? "Indisponible"
                        : "Disponible",
                },
            });
        }

        // ==========================================
        // 3. Récupération des chauffeurs
        // ==========================================

        const chauffeurs = await prisma.chauffeur.findMany({
            select: {
                id: true,
            },
        });

        // ==========================================
        // 4. Mise à jour des chauffeurs
        // ==========================================

        for (const chauffeur of chauffeurs) {
            const indisponibilite =
                await prisma.indisponibilite.findFirst({
                    where: {
                        chauffeurId: chauffeur.id,

                        debut_indisponibilite: {
                            lte: maintenant,
                        },

                        fin_indisponibilite: {
                            gte: maintenant,
                        },
                    },
                });

            await prisma.chauffeur.update({
                where: {
                    id: chauffeur.id,
                },

                data: {
                    etat: indisponibilite
                        ? "Indisponible"
                        : "Disponible",
                },
            });
        }

        // ==========================================
        // 5. Réponse
        // ==========================================

        return NextResponse.json({
            success: true,
            message:
                "Les états des véhicules et chauffeurs ont été mis à jour.",
            executedAt: maintenant.toISOString(),
        });

    } catch (error) {
        console.error(
            "CRON_UPDATE_STATUS_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Erreur lors de la mise à jour des états.",
            },
            { status: 500 }
        );
    }
}