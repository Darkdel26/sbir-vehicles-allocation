import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();

        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                {
                    error: "Tous les champs sont obligatoires",
                },
                { status: 400 }
            );
        }

        const existingAdmin = await prisma.admin.findUnique({
            where: {
                username,
            },
        });

        if (existingAdmin) {
            return NextResponse.json(
                {
                    error: "Ce nom d'utilisateur existe déjà",
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        return NextResponse.json(
            {
                message: "Admin créé avec succès",
                admin: {
                    id: admin.id,
                    username: admin.username,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Une erreur est survenue",
            },
            { status: 500 }
        );
    }
}
