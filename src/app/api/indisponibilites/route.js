import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            id_vehicule,
            chauffeurId,
            debut_indisponibilite,
            fin_indisponibilite,
            itineraire,
            motif,
        } = body;

        // ==========================================
        // 1. Vérification des champs obligatoires
        // ==========================================

        if (
            !id_vehicule ||
            !chauffeurId ||
            !debut_indisponibilite ||
            !fin_indisponibilite ||
            !itineraire ||
            !motif
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Tous les champs sont obligatoires.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 2. Conversion des dates
        // ==========================================

        const debut = new Date(debut_indisponibilite);
        const fin = new Date(fin_indisponibilite);
        const maintenant = new Date();

        // Vérification du format des dates
        if (
            Number.isNaN(debut.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Les dates fournies sont invalides.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 3. Les dates ne doivent pas être dans le passé
        // ==========================================

        if (debut < maintenant || fin < maintenant) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Les dates d'affectation ne peuvent pas être dans le passé.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 4. La fin doit être après le début
        // ==========================================

        if (fin <= debut) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "La date de fin doit être postérieure à la date de début.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 5. Vérification du véhicule
        // ==========================================

        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id: id_vehicule,
            },
        });

        if (!vehicule) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le véhicule demandé n'existe pas.",
                },
                { status: 404 }
            );
        }

        // ==========================================
        // 6. Vérification du blocage du véhicule
        // ==========================================

        if (vehicule.bloquage === "Oui") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Ce véhicule est bloqué et ne peut pas être affecté.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 7. Vérification de l'état du véhicule
        // ==========================================

        if (vehicule.etat === "Indisponible") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Ce véhicule ne sera pas disponible dans la prériode sélectionnée",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 8. Vérification du chauffeur
        // ==========================================

        const chauffeur = await prisma.chauffeur.findUnique({
            where: {
                id: chauffeurId,
            },
        });

        if (!chauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le chauffeur demandé n'existe pas.",
                },
                { status: 404 }
            );
        }

        // ==========================================
        // 9. Vérification de l'état du chauffeur
        // ==========================================

        if (chauffeur.etat === "Indisponible") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Ce chauffeur est actuellement indisponible.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 10. Vérification des indisponibilités
        //     du véhicule
        //
        // Deux périodes se chevauchent si :
        //
        // nouvelleDébut < ancienneFin
        // ET
        // nouvelleFin > ancienneDébut
        // ==========================================

        const conflitVehicule =
            await prisma.indisponibilite.findFirst({
                where: {
                    id_vehicule: id_vehicule,

                    debut_indisponibilite: {
                        lt: fin,
                    },

                    fin_indisponibilite: {
                        gt: debut,
                    },
                },
            });

        if (conflitVehicule) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Le véhicule est déjà affecté pendant cette période.",
                    conflit: {
                        debut:
                            conflitVehicule.debut_indisponibilite,
                        fin:
                            conflitVehicule.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 11. Vérification des indisponibilités
        //     du chauffeur
        // ==========================================

        const conflitChauffeur =
            await prisma.indisponibilite.findFirst({
                where: {
                    chauffeurId: chauffeurId,

                    debut_indisponibilite: {
                        lt: fin,
                    },

                    fin_indisponibilite: {
                        gt: debut,
                    },
                },
            });

        if (conflitChauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Ce chauffeur est déjà affecté pendant cette période.",
                    conflit: {
                        debut:
                            conflitChauffeur.debut_indisponibilite,
                        fin:
                            conflitChauffeur.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 12. Création de l'affectation
        // ==========================================

        const indisponibilite =
            await prisma.indisponibilite.create({
                data: {
                    id_vehicule,
                    chauffeurId,
                    debut_indisponibilite: debut,
                    fin_indisponibilite: fin,
                    itineraire: itineraire.trim(),
                    motif: motif.trim(),
                },

                include: {
                    vehicule: true,
                    chauffeur: true,
                },
            });

        // ==========================================
        // 13. Mise à jour de l'état du véhicule
        // ==========================================

        await prisma.vehicule.update({
            where: {
                id: id_vehicule,
            },

            data: {
                etat: "Indisponible",
            },
        });

        // ==========================================
        // 14. Mise à jour de l'état du chauffeur
        // ==========================================

        await prisma.chauffeur.update({
            where: {
                id: chauffeurId,
            },

            data: {
                etat: "Indisponible",
            },
        });

        return NextResponse.json(
            {
                success: true,
                message:
                    "Le véhicule a été affecté avec succès.",
                data: indisponibilite,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "CREATE_AFFECTATION_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Une erreur est survenue lors de l'affectation du véhicule.",
            },
            { status: 500 }
        );
    }
}