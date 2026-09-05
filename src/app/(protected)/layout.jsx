import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminLayout from "@/components/AdminLayout";

export default async function Layout({ children }) {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get("admin_session")?.value;

    if (!sessionId) {
        redirect("/login");
    }

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    });

    if (!session || session.expiresAt < new Date()) {
        redirect("/login");
    }

    return (
        <AdminLayout>
            {children}
        </AdminLayout>
    );
}
