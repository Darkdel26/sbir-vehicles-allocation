-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chauffeur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "etat" TEXT NOT NULL DEFAULT 'Disponible'
);
INSERT INTO "new_Chauffeur" ("id", "nom", "prenom") SELECT "id", "nom", "prenom" FROM "Chauffeur";
DROP TABLE "Chauffeur";
ALTER TABLE "new_Chauffeur" RENAME TO "Chauffeur";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
