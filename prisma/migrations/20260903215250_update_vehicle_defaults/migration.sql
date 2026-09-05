-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "designation" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "etat" TEXT NOT NULL DEFAULT 'Disponible',
    "bloquage" TEXT NOT NULL DEFAULT 'Non'
);
INSERT INTO "new_Vehicule" ("bloquage", "designation", "etat", "id", "matricule") SELECT "bloquage", "designation", "etat", "id", "matricule" FROM "Vehicule";
DROP TABLE "Vehicule";
ALTER TABLE "new_Vehicule" RENAME TO "Vehicule";
CREATE UNIQUE INDEX "Vehicule_matricule_key" ON "Vehicule"("matricule");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
