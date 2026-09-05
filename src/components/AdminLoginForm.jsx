"use client";
import { LockKeyhole, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginForm() {

    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function verifyLogin(event) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Identifiants incorrects");
                return;
            }

            console.log("Connexion réussie :", data);

            router.push("/vehicles");
        } catch (error) {
            console.error(error);
            setError("Impossible de contacter le serveur");
        } finally {
            setLoading(false);
        }
    }



    return (
        <main className="min-h-screen bg-muted/40 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="rounded-xl border bg-background p-8 shadow-sm">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <LockKeyhole className="h-6 w-6" />
                        </div>

                        <h1 className="text-2xl font-bold">
                            Connexion
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Connectez-vous à votre espace administrateur
                        </p>
                    </div>

                    <form onSubmit={verifyLogin} className="space-y-5" autoComplete="off" method="POST">
                        <div className="space-y-2">
                            <Label htmlFor="username">
                                Nom d'utilisateur <span className="text-red-500 font-bold">*</span>
                            </Label>

                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    placeholder="Nom d'utilisateur"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Mot de passe <span className="text-red-500 font-bold">*</span>
                            </Label>

                            <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>

                        <Link href="/" className="w-full underline">Retour à l'accueil</Link>

                        {error && (<p className="text-sm text-red-500 mt-3 font-bold">{error}</p>)}
                    </form>
                </div>
            </div>
        </main>
    );
}