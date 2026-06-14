/*
  Warnings:

  - You are about to drop the `Tile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tile" DROP CONSTRAINT "Tile_ownerId_fkey";

-- AlterTable
ALTER TABLE "ActivitySession" ADD COLUMN     "routeId" TEXT,
ADD COLUMN     "territoryId" TEXT;

-- DropTable
DROP TABLE "Tile";

-- CreateTable
CREATE TABLE "Territory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "areaM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" JSONB NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Territory" ADD CONSTRAINT "Territory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
