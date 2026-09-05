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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Search,
    Car,
    AlertCircle,
    History,
    Calendar,
    MapPin,
    FileText,
} from "lucide-react";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Historique
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadVehicles = async () => {
            console.log("Je vais cherhcer")
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/vehicles",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer les véhicules"
                    );
                }

                const data = await response.json();

                if (isMounted) {
                    setVehicles(data);
                }
            } catch (error) {
                console.error(
                    "LOAD_VEHICLES_ERROR:",
                    error
                );

                if (isMounted) {
                    setError(
                        "Impossible de charger les véhicules."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        // Premier chargement immédiat
        loadVehicles();

        // Actualisation toutes les 60 secondes
        const interval = setInterval(() => {
            loadVehicles();
        }, 30 * 1000);

        // Nettoyage de l'intervalle
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const filteredVehicles = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return vehicles;
        }

        return vehicles.filter((vehicle) =>
            vehicle.designation
                .toLowerCase()
                .includes(value) ||
            vehicle.matricule
                .toLowerCase()
                .includes(value) ||
            vehicle.etat
                .toLowerCase()
                .includes(value)
        );
    }, [vehicles, search]);

    /**
     * Ouvre l'historique d'un véhicule.
     */
    const handleOpenHistory = async (vehicle) => {
        // Les véhicules bloqués ne peuvent pas afficher
        // leur historique.
        if (vehicle.bloquage !== "Non") {
            return;
        }

        setSelectedVehicle(vehicle);
        setHistory([]);
        setHistoryError("");
        setHistoryLoading(true);

        try {
            const response = await fetch(
                `/api/vehicles/${vehicle.id}/indisponibilites`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de récupérer l'historique"
                );
            }

            setHistory(data);
        } catch (error) {
            console.error("LOAD_HISTORY_ERROR:", error);

            setHistoryError(
                error.message ||
                "Impossible de récupérer l'historique."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    /**
     * Ferme le modal.
     */
    const handleCloseHistory = () => {
        setSelectedVehicle(null);
        setHistory([]);
        setHistoryError("");
    };

    /**
     * Formatage des dates.
     */
    const formatDate = (date) => {
        return new Date(date).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

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
                            Véhicules
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Car className="h-6 w-6" />

                        <h1 className="text-2xl font-semibold">
                            Véhicules
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consultez les véhicules enregistrés.
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
                        placeholder="Rechercher un véhicule..."
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
                    {filteredVehicles.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center">
                            <Car className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                            <p className="font-medium">
                                {search
                                    ? "Aucun véhicule trouvé"
                                    : "Aucun véhicule enregistré"}
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
                                    Désignation
                                </div>

                                <div className="col-span-3">
                                    Matricule
                                </div>

                                <div className="col-span-2">
                                    État
                                </div>

                                <div className="col-span-2 text-right">
                                    Historique
                                </div>
                            </div>

                            {/* Véhicules */}
                            {filteredVehicles.map(
                                (vehicle) => {
                                    const canViewHistory =
                                        vehicle.bloquage ===
                                        "Non";

                                    return (
                                        <div
                                            key={vehicle.id}
                                            onClick={() =>
                                                handleOpenHistory(
                                                    vehicle
                                                )
                                            }
                                            className={`grid grid-cols-12 items-center border-b px-4 py-4 text-sm last:border-b-0 ${canViewHistory
                                                ? "cursor-pointer hover:bg-muted/30"
                                                : ""
                                                }`}
                                        >
                                            <div className="col-span-5 font-medium">
                                                {
                                                    vehicle.designation
                                                }
                                            </div>

                                            <div className="col-span-3 text-muted-foreground">
                                                {
                                                    vehicle.matricule
                                                }
                                            </div>

                                            <div className="col-span-2">
                                                <Badge
                                                    variant={
                                                        vehicle.etat ===
                                                            "Disponible"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                >
                                                    {
                                                        vehicle.etat
                                                    }
                                                </Badge>
                                            </div>

                                            <div className="col-span-2 flex justify-end">
                                                {canViewHistory ? (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <History className="h-4 w-4" />

                                                        <span className="hidden md:inline">
                                                            Voir
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal historique */}
            <Dialog
                open={!!selectedVehicle}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseHistory();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />

                            Historique des indisponibilités
                        </DialogTitle>

                        <DialogDescription>
                            {selectedVehicle?.designation} —{" "}
                            {selectedVehicle?.matricule}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Chargement */}
                    {historyLoading && (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border p-4"
                                    >
                                        <Skeleton className="h-5 w-48" />

                                        <Skeleton className="mt-3 h-4 w-64" />

                                        <Skeleton className="mt-2 h-4 w-56" />
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {/* Erreur */}
                    {!historyLoading &&
                        historyError && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />

                                {historyError}
                            </div>
                        )}

                    {/* Aucun historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length === 0 && (
                            <div className="py-10 text-center">
                                <History className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                                <p className="font-medium">
                                    Aucun historique
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ce véhicule n'a aucune
                                    indisponibilité enregistrée.
                                </p>
                            </div>
                        )}

                    {/* Historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length > 0 && (
                            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border p-4"
                                    >
                                        {/* Itinéraire */}
                                        <div className="flex items-start gap-3">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                            <div>
                                                <p className="font-medium">
                                                    {
                                                        item.itineraire
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="mt-3 flex items-start gap-3">
                                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                            <div className="text-sm text-muted-foreground">
                                                <p>
                                                    Début :{" "}
                                                    {formatDate(
                                                        item.debut_indisponibilite
                                                    )}
                                                </p>

                                                <p>
                                                    Fin :{" "}
                                                    {formatDate(item.fin_indisponibilite)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Motif */}
                                        <div className="mt-3 flex items-start gap-3">
                                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                            <p className="text-sm text-muted-foreground">
                                                {item.motif}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
