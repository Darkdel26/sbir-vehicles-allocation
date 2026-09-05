"use client";
import { useEffect, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Car,
    UserRound,
    Calendar,
    MapPin,
    FileText,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from "lucide-react";

export default function page() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);

    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [loadingDrivers, setLoadingDrivers] = useState(true);

    const [formLoading, setFormLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        id_vehicule: "",
        chauffeurId: "",
        debut_indisponibilite: "",
        fin_indisponibilite: "",
        itineraire: "",
        motif: "",
    });

    /**
     * Récupération des véhicules
     */
    useEffect(() => {
        const loadVehicles = async () => {
            try {
                setLoadingVehicles(true);

                const response = await fetch("/api/vehicles");

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Impossible de récupérer les véhicules."
                    );
                }

                /*
                 * On ne conserve que les véhicules
                 * qui ne sont pas bloqués.
                 */
                const availableVehicles = data.filter(
                    (vehicle) =>
                        vehicle.bloquage === "Non"
                );

                setVehicles(availableVehicles);
            } catch (error) {
                console.error(
                    "LOAD_VEHICLES_ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Impossible de charger les véhicules."
                );
            } finally {
                setLoadingVehicles(false);
            }
        };

        loadVehicles();
    }, []);

    /**
     * Récupération des chauffeurs
     */
    useEffect(() => {
        const loadDrivers = async () => {
            try {
                setLoadingDrivers(true);

                const response = await fetch(
                    "/api/chauffeurs?etat=Disponible"
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "Impossible de récupérer les chauffeurs."
                    );
                }

                setDrivers(result.data || []);
            } catch (error) {
                console.error(
                    "LOAD_DRIVERS_ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Impossible de charger les chauffeurs."
                );
            } finally {
                setLoadingDrivers(false);
            }
        };

        loadDrivers();
    }, []);

    /**
     * Modification d'un champ
     */
    const handleChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError("");
        setSuccess("");
    };

    /**
     * Soumission du formulaire
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        // ==============================
        // Validation frontend
        // ==============================

        if (!form.id_vehicule) {
            setError("Veuillez sélectionner un véhicule.");
            return;
        }

        if (!form.chauffeurId) {
            setError("Veuillez sélectionner un chauffeur.");
            return;
        }

        if (!form.debut_indisponibilite) {
            setError(
                "Veuillez sélectionner la date de début."
            );
            return;
        }

        if (!form.fin_indisponibilite) {
            setError(
                "Veuillez sélectionner la date de fin."
            );
            return;
        }

        if (!form.itineraire.trim()) {
            setError("Veuillez renseigner l'itinéraire.");
            return;
        }

        if (!form.motif.trim()) {
            setError("Veuillez renseigner le motif.");
            return;
        }

        const debut = new Date(
            form.debut_indisponibilite
        );

        const fin = new Date(
            form.fin_indisponibilite
        );

        const maintenant = new Date();

        if (debut < maintenant) {
            setError(
                "La date de début ne peut pas être dans le passé."
            );
            return;
        }

        if (fin < maintenant) {
            setError(
                "La date de fin ne peut pas être dans le passé."
            );
            return;
        }

        if (fin <= debut) {
            setError(
                "La date de fin doit être postérieure à la date de début."
            );
            return;
        }

        // ==============================
        // Envoi
        // ==============================

        try {
            setFormLoading(true);

            const response = await fetch(
                "/api/indisponibilites",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    "Impossible d'effectuer l'affectation."
                );
            }

            setSuccess(
                result.message ||
                "Le véhicule a été affecté avec succès."
            );

            // Réinitialisation du formulaire
            setForm({
                id_vehicule: "",
                chauffeurId: "",
                debut_indisponibilite: "",
                fin_indisponibilite: "",
                itineraire: "",
                motif: "",
            });
        } catch (error) {
            console.error(
                "CREATE_ALLOCATION_ERROR:",
                error
            );

            setError(
                error.message ||
                "Une erreur est survenue lors de l'affectation."
            );
        } finally {
            setFormLoading(false);
        }
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
                            Affectation
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <div className="flex items-center gap-2">
                    <Car className="h-6 w-6" />

                    <h1 className="text-2xl font-semibold">
                        Affectation d'un véhicule
                    </h1>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                    Affectez un véhicule à un chauffeur pour
                    une période donnée.
                </p>
            </div>

            {/* Messages */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />

                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert>
                    <CheckCircle2 className="h-4 w-4" />

                    <AlertDescription>
                        {success}
                    </AlertDescription>
                </Alert>
            )}

            {/* Formulaire */}
            <form
                onSubmit={handleSubmit}
                className="rounded-lg border bg-card p-6"
            >
                <div className="space-y-6">
                    {/* Véhicule + Chauffeur */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Véhicule */}
                        <div className="space-y-2">
                            <Label htmlFor="vehicule">
                                Véhicule
                            </Label>

                            <Select
                                value={form.id_vehicule}
                                onValueChange={(value) =>
                                    handleChange(
                                        "id_vehicule",
                                        value
                                    )
                                }
                                disabled={loadingVehicles}
                            >
                                <SelectTrigger id="vehicule">
                                    <SelectValue
                                        placeholder={
                                            loadingVehicles
                                                ? "Chargement..."
                                                : "Sélectionner un véhicule"
                                        }
                                    />
                                </SelectTrigger>

                                <SelectContent className="w-full">
                                    {vehicles.length === 0 ? (
                                        <SelectItem
                                            value="none"
                                            disabled
                                        >
                                            Aucun véhicule disponible
                                        </SelectItem>
                                    ) : (
                                        vehicles.map(
                                            (vehicle) => (
                                                <SelectItem
                                                    key={
                                                        vehicle.id
                                                    }
                                                    value={
                                                        vehicle.id
                                                    }
                                                >
                                                    {
                                                        vehicle.designation
                                                    }{" "}
                                                    —{" "}
                                                    {
                                                        vehicle.matricule
                                                    }
                                                </SelectItem>
                                            )
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Chauffeur */}
                        <div className="space-y-2">
                            <Label htmlFor="chauffeur">
                                Chauffeur
                            </Label>

                            <Select
                                value={form.chauffeurId}
                                onValueChange={(value) =>
                                    handleChange(
                                        "chauffeurId",
                                        value
                                    )
                                }
                                disabled={loadingDrivers}
                            >
                                <SelectTrigger id="chauffeur">
                                    <SelectValue
                                        placeholder={
                                            loadingDrivers
                                                ? "Chargement..."
                                                : "Sélectionner un chauffeur"
                                        }
                                    />
                                </SelectTrigger>

                                <SelectContent className="w-full">
                                    {drivers.length === 0 ? (
                                        <SelectItem
                                            value="none"
                                            disabled
                                        >
                                            Aucun chauffeur disponible
                                        </SelectItem>
                                    ) : (
                                        drivers.map(
                                            (driver) => (
                                                <SelectItem
                                                    key={
                                                        driver.id
                                                    }
                                                    value={
                                                        driver.id
                                                    }
                                                >
                                                    {driver.nom}{" "}
                                                    {
                                                        driver.prenom
                                                    }
                                                </SelectItem>
                                            )
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Début */}
                        <div className="space-y-2">
                            <Label htmlFor="debut">
                                Date et heure de début
                            </Label>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="debut"
                                    type="datetime-local"
                                    value={
                                        form.debut_indisponibilite
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "debut_indisponibilite",
                                            event.target.value
                                        )
                                    }
                                    className="pl-9"
                                    min={getMinDateTime()}
                                />
                            </div>
                        </div>

                        {/* Fin */}
                        <div className="space-y-2">
                            <Label htmlFor="fin">
                                Date et heure de fin
                            </Label>

                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="fin"
                                    type="datetime-local"
                                    value={
                                        form.fin_indisponibilite
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "fin_indisponibilite",
                                            event.target.value
                                        )
                                    }
                                    className="pl-9"
                                    min={
                                        form.debut_indisponibilite ||
                                        getMinDateTime()
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Itinéraire */}
                    <div className="space-y-2">
                        <Label htmlFor="itineraire">
                            Itinéraire
                        </Label>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                            <Textarea
                                id="itineraire"
                                value={form.itineraire}
                                onChange={(event) =>
                                    handleChange(
                                        "itineraire",
                                        event.target.value
                                    )
                                }
                                placeholder="Ex : Cotonou → Porto-Novo"
                                className="min-h-24 pl-9"
                            />
                        </div>
                    </div>

                    {/* Motif */}
                    <div className="space-y-2">
                        <Label htmlFor="motif">
                            Motif
                        </Label>

                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                            <Textarea
                                id="motif"
                                value={form.motif}
                                onChange={(event) =>
                                    handleChange(
                                        "motif",
                                        event.target.value
                                    )
                                }
                                placeholder="Ex : Mission professionnelle"
                                className="min-h-24 pl-9"
                            />
                        </div>
                    </div>

                    {/* Bouton */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={formLoading}
                        >
                            {formLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                    Affectation...
                                </>
                            ) : (
                                <>
                                    <Car className="mr-2 h-4 w-4" />

                                    Affecter le véhicule
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

/**
 * Date minimale pour les inputs datetime-local.
 *
 * Format attendu :
 * YYYY-MM-DDTHH:mm
 */
function getMinDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        now.getDate()
    ).padStart(2, "0");
    const hours = String(
        now.getHours()
    ).padStart(2, "0");
    const minutes = String(
        now.getMinutes()
    ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
