"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeftRight, Car, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function AdminLayout({ children }) {
    const navbarLinks = [
        {
            title: "Véhicules",
            url: "/vehicles",
            icon: Car,
        },
        {
            title: "CVA",
            url: "/administrative-vehicle-drivers",
            icon: UserRound,
        },
        {
            title: "Affectations",
            url: "/vehicle-allocation",
            icon: ArrowLeftRight,
        },
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la déconnexion");
            }

            window.location.href = "/login";
        } catch (error) {
            console.error("LOGOUT_ERROR:", error);
        }
    };


    const { setTheme } = useTheme()

    return (
        <SidebarProvider>
            <Sidebar>
                {/* Header */}
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Car className="size-4" />
                                </div>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Gestion de véhicules
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Administration
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                {/* Navigation */}
                <SidebarContent>
                    <SidebarMenu className="px-2">
                        {navbarLinks.map((link, index) => (
                            <SidebarMenuItem key={index}>
                                <SidebarMenuButton className="flex gap-1">
                                    <Link href={link.url} className="flex gap-1">
                                        <link.icon />
                                        <span>{link.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                {/* Footer */}
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={handleLogout}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            >
                                <LogOut />
                                <span>Déconnexion</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Main content */}
            <main className="flex min-h-screen flex-1 flex-col">
                <nav className="flex h-14 items-center justify-between border-b px-4">
                    <SidebarTrigger />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                                <Sun /> Clair
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                                <Moon /> Sombre
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                                <Monitor /> Système
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                <div className="flex-1 p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}