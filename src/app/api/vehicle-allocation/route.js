import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        // ============================================================
        // 1. Vérification de la session
        // ============================================================
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

        // ============================================================
        // 2. Lecture du body
        // ============================================================
        const body = await request.json();

        const {
            id_vehicule,
            debut_indisponibilite,
            fin_indisponibilite,
            itineraire,
            motif,
        } = body;

        // ============================================================
        // 3. Validation des champs
        // ============================================================
        if (
            !id_vehicule ||
            !debut_indisponibilite ||
            !fin_indisponibilite ||
            !itineraire ||
            !motif
        ) {
            return NextResponse.json(
                {
                    error: "Tous les champs sont obligatoires",
                },
                { status: 400 }
            );
        }

        // ============================================================
        // 4. Conversion des dates
        // ============================================================
        const debut = new Date(debut_indisponibilite);
        const fin = new Date(fin_indisponibilite);

        if (
            Number.isNaN(debut.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            return NextResponse.json(
                {
                    error: "Les dates sont invalides",
                },
                { status: 400 }
            );
        }

        // ============================================================
        // 5. Les dates doivent commencer à partir de maintenant
        // ============================================================
        const maintenant = new Date();

        if (debut < maintenant) {
            return NextResponse.json(
                {
                    error: "La date de début doit être à partir de maintenant",
                },
                { status: 400 }
            );
        }

        if (fin < maintenant) {
            return NextResponse.json(
                {
                    error: "La date de fin doit être à partir de maintenant",
                },
                { status: 400 }
            );
        }

        // ============================================================
        // 6. Vérification de l'ordre des dates
        // ============================================================
        if (fin <= debut) {
            return NextResponse.json(
                {
                    error: "La date de fin doit être supérieure à la date de début",
                },
                { status: 400 }
            );
        }

        // ============================================================
        // 7. Vérification du véhicule
        // ============================================================
        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id: id_vehicule,
            },
        });

        if (!vehicule) {
            return NextResponse.json(
                {
                    error: "Véhicule introuvable",
                },
                { status: 404 }
            );
        }

        // ============================================================
        // 8. Vérification du blocage du véhicule
        // ============================================================
        if (vehicule.bloquage === "Oui") {
            return NextResponse.json(
                {
                    error: "Ce véhicule est bloqué et ne peut pas être alloué",
                },
                { status: 409 }
            );
        }

        // ============================================================
        // 9. Vérification des indisponibilités existantes
        //
        // Deux périodes se chevauchent si :
        //
        // nouvelle_debut < ancienne_fin
        // ET
        // nouvelle_fin > ancienne_debut
        //
        // Exemple :
        //
        // Existante : 10h ---- 15h
        // Nouvelle   :       13h ---- 18h
        //
        // => chevauchement => refus
        // ============================================================
        const conflit = await prisma.indisponibilite.findFirst({
            where: {
                id_vehicule,

                AND: [
                    {
                        debut_indisponibilite: {
                            lt: fin,
                        },
                    },
                    {
                        fin_indisponibilite: {
                            gt: debut,
                        },
                    },
                ],
            },
        });

        if (conflit) {
            return NextResponse.json(
                {
                    error:
                        "Ce véhicule est déjà indisponible pendant la période demandée",
                    indisponibilite: {
                        id: conflit.id,
                        debut: conflit.debut_indisponibilite,
                        fin: conflit.fin_indisponibilite,
                        itineraire: conflit.itineraire,
                        motif: conflit.motif,
                    },
                },
                { status: 409 }
            );
        }

        // ============================================================
        // 10. Création de l'allocation
        // ============================================================
        const indisponibilite =
            await prisma.indisponibilite.create({
                data: {
                    id_vehicule,
                    debut_indisponibilite: debut,
                    fin_indisponibilite: fin,
                    itineraire: itineraire.trim(),
                    motif: motif.trim(),
                },
            });

        // ============================================================
        // 11. Réponse
        // ============================================================
        return NextResponse.json(
            {
                message: "Allocation créée avec succès",
                indisponibilite,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("CREATE_ALLOCATION_ERROR:", error);

        return NextResponse.json(
            {
                error:
                    "Une erreur est survenue lors de la création de l'allocation",
            },
            { status: 500 }
        );
    }
}