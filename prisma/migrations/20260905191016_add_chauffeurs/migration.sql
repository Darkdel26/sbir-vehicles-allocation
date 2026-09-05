/*
  Warnings:

  - Added the required column `chauffeurId` to the `Indisponibilite` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Indisponibilite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_vehicule" TEXT NOT NULL,
    "chauffeurId" TEXT NOT NULL,
    "debut_indisponibilite" DATETIME NOT NULL,
    "fin_indisponibilite" DATETIME NOT NULL,
    "itineraire" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    CONSTRAINT "Indisponibilite_id_vehicule_fkey" FOREIGN KEY ("id_vehicule") REFERENCES "Vehicule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Indisponibilite_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Indisponibilite" ("debut_indisponibilite", "fin_indisponibilite", "id", "id_vehicule", "itineraire", "motif") SELECT "debut_indisponibilite", "fin_indisponibilite", "id", "id_vehicule", "itineraire", "motif" FROM "Indisponibilite";
DROP TABLE "Indisponibilite";
ALTER TABLE "new_Indisponibilite" RENAME TO "Indisponibilite";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
