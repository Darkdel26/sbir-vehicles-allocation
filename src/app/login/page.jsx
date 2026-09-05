import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminLoginForm from "@/components/AdminLoginForm";

export default async function page() {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get("admin_session")?.value;

    if (sessionId) {
        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (session && session.expiresAt > new Date()) {
            redirect("/vehicles");
        }
    }

    return <AdminLoginForm />;
}
