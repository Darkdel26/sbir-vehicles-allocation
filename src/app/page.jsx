"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Car, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchVehicles = async () => {
            try {
                const response = await fetch(
                    "/api/public/vehicles",
                    {
                        // Évite de récupérer une réponse mise en cache
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Erreur lors du chargement des véhicules"
                    );
                }

                const data = await response.json();

                if (isMounted) {
                    setVehicles(data);
                }
            } catch (error) {
                console.error(
                    "FETCH_VEHICLES_ERROR:",
                    error
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Premier chargement immédiat
        fetchVehicles();

        // Actualisation toutes les 60 secondes
        const interval = setInterval(() => {
            fetchVehicles();
        }, 30 * 1000);

        // Nettoyage lorsque le composant est démonté
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);


    const filteredVehicles = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return vehicles;

        return vehicles.filter(
            (vehicle) =>
                vehicle.designation.toLowerCase().includes(value) ||
                vehicle.matricule.toLowerCase().includes(value)
        );
    }, [vehicles, search]);

    return (
        <main className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="border-b bg-background">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Car className="size-5" />
                        </div>

                        <span className="font-semibold">
                            Véhicules
                        </span>
                    </Link>

                    <Link
                        href="/login"
                        className="py-1 px-2 rounded-sm text-white text-sm font-medium bg-primary"
                    >
                        Gestion
                    </Link>
                </div>
            </nav>

            {/* Recherche */}
            <section
                className="relative bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('/home-bg.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative mx-auto max-w-6xl px-4 py-20">
                    <div className="relative mx-auto max-w-xl">
                        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un véhicule..."
                            className="h-12 bg-white pl-12 text-black shadow-lg"
                        />
                    </div>
                </div>
            </section>

            {/* Liste */}
            <section className="mx-auto max-w-6xl px-4 py-8">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>

                                <Skeleton className="h-6 w-24" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border">
                        {/* En-tête */}
                        <div className="grid grid-cols-3 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                            <span>Désignation</span>
                            <span>Matricule</span>
                            <span>État</span>
                        </div>

                        {/* Véhicules */}
                        {filteredVehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="grid grid-cols-3 items-center border-b px-4 py-4 text-sm last:border-0 hover:bg-muted/30"
                            >
                                <span className="font-medium">
                                    {vehicle.designation}
                                </span>

                                <span className="text-muted-foreground">
                                    {vehicle.matricule}
                                </span>

                                <span>
                                    <Badge
                                        variant={
                                            vehicle.etat === "Disponible"
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {vehicle.etat}
                                    </Badge>
                                </span>
                            </div>
                        ))}

                        {/* Aucun résultat */}
                        {filteredVehicles.length === 0 && (
                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                Aucun véhicule trouvé.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}