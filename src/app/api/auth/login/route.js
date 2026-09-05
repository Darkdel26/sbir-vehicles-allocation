import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";


export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (username.trim() === "" || password.trim() === "") {
            return NextResponse.json(
                {
                    error: "Tous les champs sont requis",
                },
                {
                    status: 400,
                }
            );
        }

        const admin = await prisma.admin.findUnique({
            where: {
                username,
            },
        });

        if (!admin) {
            return NextResponse.json(
                {
                    error: "Identifiants incorrects",
                },
                {
                    status: 401,
                }
            );
        }

        const passwordValid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordValid) {
            return NextResponse.json(
                {
                    error: "Identifiants incorrects",
                },
                {
                    status: 401,
                }
            );
        }

        const sessionId = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.session.create({
            data: {
                id: sessionId,
                adminId: admin.id,
                expiresAt,
            },
        });

        const response = NextResponse.json({
            message: "Connexion réussie",
        });

        response.cookies.set("admin_session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("LOGIN_ERROR:", error);

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
