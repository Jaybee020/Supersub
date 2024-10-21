-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('RECURRING', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INFORMATIONAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "eoaAddress" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "smartAccountAddress" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "destinationChain" INTEGER NOT NULL,
    "onchainReference" INTEGER NOT NULL,
    "receivingAddress" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "chargeInterval" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "onchainReference" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productOnchainReference" INTEGER NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "narration" TEXT NOT NULL,
    "sender" TEXT,
    "recipient" TEXT,
    "type" "TransactionType" NOT NULL,
    "onchainReference" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "subscriptionOnchainReference" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "onchainReference" INTEGER NOT NULL,
    "subscriptionExpiry" TIMESTAMP(3),
    "lastChargeDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorAddress" TEXT NOT NULL,
    "planOnchainReference" INTEGER NOT NULL,
    "productOnchainReference" INTEGER NOT NULL,
    "subscriberAddress" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "decimals" INTEGER,
    "symbol" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "publicKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountAddress" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cache" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ttl" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_eoaAddress_key" ON "Account"("eoaAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Account_emailAddress_key" ON "Account"("emailAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Account_smartAccountAddress_key" ON "Account"("smartAccountAddress");

-- CreateIndex
CREATE INDEX "Account_smartAccountAddress_idx" ON "Account" USING HASH ("smartAccountAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Product_onchainReference_key" ON "Product"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_onchainReference_key" ON "Plan"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_onchainReference_key" ON "Transaction"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_onchainReference_key" ON "Subscription"("onchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subscriberAddress_productOnchainReference_key" ON "Subscription"("subscriberAddress", "productOnchainReference");

-- CreateIndex
CREATE UNIQUE INDEX "Token_address_key" ON "Token"("address");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_publicKey_key" ON "ApiKey"("publicKey");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_secretKey_key" ON "ApiKey"("secretKey");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_accountAddress_key" ON "ApiKey"("accountAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Cache_key_key" ON "Cache"("key");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_creatorAddress_fkey" FOREIGN KEY ("creatorAddress") REFERENCES "Account"("smartAccountAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_subscriptionOnchainReference_fkey" FOREIGN KEY ("subscriptionOnchainReference") REFERENCES "Subscription"("onchainReference") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_creatorAddress_fkey" FOREIGN KEY ("creatorAddress") REFERENCES "Account"("smartAccountAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planOnchainReference_fkey" FOREIGN KEY ("planOnchainReference") REFERENCES "Plan"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_productOnchainReference_fkey" FOREIGN KEY ("productOnchainReference") REFERENCES "Product"("onchainReference") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriberAddress_fkey" FOREIGN KEY ("subscriberAddress") REFERENCES "Account"("smartAccountAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account"("smartAccountAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
