"use client";
import { useEffect, useMemo, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    UserRound,
    AlertCircle,
} from "lucide-react";

export default function page() {
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /**
     * Récupération des chauffeurs
     */
    useEffect(() => {
        let isMounted = true;

        const loadDrivers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/chauffeurs",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer les chauffeurs"
                    );
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message ||
                        "Impossible de récupérer les chauffeurs"
                    );
                }

                if (isMounted) {
                    setDrivers(result.data);
                }
            } catch (error) {
                console.error(
                    "LOAD_DRIVERS_ERROR:",
                    error
                );

                if (isMounted) {
                    setError(
                        "Impossible de charger les chauffeurs."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Premier chargement immédiat
        loadDrivers();

        // Actualisation toutes les 60 secondes
        const interval = setInterval(() => {
            loadDrivers();
        }, 30 * 1000);

        // Nettoyage
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    /**
     * Recherche
     */
    const filteredDrivers = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return drivers;
        }

        return drivers.filter((driver) =>
            driver.nom
                .toLowerCase()
                .includes(value) ||
            driver.prenom
                .toLowerCase()
                .includes(value) ||
            driver.etat
                .toLowerCase()
                .includes(value)
        );
    }, [drivers, search]);

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        Administration
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            Chauffeurs
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <UserRound className="h-6 w-6" />

                        <h1 className="text-2xl font-semibold">
                            Chauffeurs
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consultez les chauffeurs enregistrés.
                    </p>
                </div>

                {/* Recherche */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Rechercher un chauffeur..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Erreur */}
            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />

                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-40" />

                                        <Skeleton className="h-4 w-28" />
                                    </div>

                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Liste */}
            {!loading && !error && (
                <>
                    {filteredDrivers.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center">
                            <UserRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                            <p className="font-medium">
                                {search
                                    ? "Aucun chauffeur trouvé"
                                    : "Aucun chauffeur enregistré"}
                            </p>

                            {search && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Essayez une autre recherche.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border">
                            {/* En-tête */}
                            <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                                <div className="col-span-5">
                                    Nom
                                </div>

                                <div className="col-span-5">
                                    Prénom
                                </div>

                                <div className="col-span-2">
                                    Disponibilité
                                </div>
                            </div>

                            {/* Chauffeurs */}
                            {filteredDrivers.map(
                                (driver) => (
                                    <div
                                        key={driver.id}
                                        className="grid grid-cols-12 items-center border-b px-4 py-4 text-sm last:border-b-0"
                                    >
                                        <div className="col-span-5 font-medium uppercase">
                                            {driver.nom}
                                        </div>

                                        <div className="col-span-5 text-muted-foreground">
                                            {driver.prenom}
                                        </div>

                                        <div className="col-span-2">
                                            <Badge
                                                variant={
                                                    driver.etat ===
                                                        "Disponible"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {driver.etat}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}