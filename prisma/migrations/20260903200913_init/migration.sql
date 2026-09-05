-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designation" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "etat" TEXT NOT NULL DEFAULT 'Indisponible',
    "bloquage" TEXT NOT NULL DEFAULT 'Non'
);

-- CreateTable
CREATE TABLE "Indisponibilite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_vehicule" TEXT NOT NULL,
    "debut_indisponibilite" DATETIME NOT NULL,
    "fin_indisponibilite" DATETIME NOT NULL,
    "itineraire" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    CONSTRAINT "Indisponibilite_id_vehicule_fkey" FOREIGN KEY ("id_vehicule") REFERENCES "Vehicule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_matricule_key" ON "Vehicule"("matricule");
