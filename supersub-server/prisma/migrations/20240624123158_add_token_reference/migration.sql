/*
  Warnings:

  - You are about to drop the column `destinationChain` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `receivingAddress` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tokenAddress` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[onchainReference]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[onchainReference]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chainId` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinationChain` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivingAddress` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenAddress` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenOnchainReference` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beneficiaryAddress` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTokenAddress` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTokenOnchainReference` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `onchainReference` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenOnchainReference` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Plan" DROP CONSTRAINT "Plan_productOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_creatorAddress_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tokenAddress_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_creatorAddress_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_productOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_subscriberAddress_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_subscriptionOnchainReference_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_tokenAddress_fkey";

-- DropIndex
DROP INDEX "Token_address_key";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "destinationChain" INTEGER NOT NULL,
ADD COLUMN     "receivingAddress" TEXT NOT NULL,
ADD COLUMN     "tokenAddress" TEXT NOT NULL,
ADD COLUMN     "tokenOnchainReference" TEXT NOT NULL,
ALTER COLUMN "onchainReference" SET DATA TYPE TEXT,
ALTER COLUMN "productOnchainReference" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "destinationChain",
DROP COLUMN "receivingAddress",
DROP COLUMN "tokenAddress",
ADD COLUMN     "chainId" INTEGER NOT NULL,
ALTER COLUMN "onchainReference" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "beneficiaryAddress" TEXT NOT NULL,
ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "paymentTokenAddress" TEXT NOT NULL,
ADD COLUMN     "paymentTokenOnchainReference" TEXT NOT NULL,
ALTER COLUMN "onchainReference" SET DATA TYPE TEXT,
ALTER COLUMN "planOnchainReference" SET DATA TYPE TEXT,
ALTER COLUMN "productOnchainReference" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "onchainReference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "chainId" INTEGER NOT NULL,
ADD COLUMN     "tokenOnchainReference" TEXT NOT NULL,
ALTER COLUMN "subscriptionOnchainReference" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Token_onchainReference_key" ON "Token"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_onchainReference_key" ON "Transaction"("onchainReference");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_tokenOnchainReference_fkey" FOREIGN KEY ("tokenOnchainReference") REFERENCES "Token"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tokenOnchainReference_fkey" FOREIGN KEY ("tokenOnchainReference") REFERENCES "Token"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionOnchainReference_fkey" FOREIGN KEY ("subscriptionOnchainReference") REFERENCES "Subscription"("onchainReference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planOnchainReference_fkey" FOREIGN KEY ("planOnchainReference") REFERENCES "Plan"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_paymentTokenOnchainReference_fkey" FOREIGN KEY ("paymentTokenOnchainReference") REFERENCES "Token"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;
