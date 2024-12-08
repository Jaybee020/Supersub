/*
  Warnings:

  - You are about to drop the column `eoaAddress` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_accountAddress_fkey";

-- DropIndex
DROP INDEX "Account_emailAddress_key";

-- DropIndex
DROP INDEX "Account_eoaAddress_key";

-- DropIndex
DROP INDEX "Account_smartAccountAddress_idx";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "eoaAddress";

-- DropTable
DROP TABLE "ApiKey";
