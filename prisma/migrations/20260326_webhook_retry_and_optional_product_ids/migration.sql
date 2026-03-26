-- AlterTable: Add webhook retry fields to WebhookLog
ALTER TABLE "WebhookLog" ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WebhookLog" ADD COLUMN "nextRetryAt" TIMESTAMP(3);

-- CreateIndex: Composite index for webhook retry queries
CREATE INDEX "WebhookLog_success_nextRetryAt_retryCount_idx" ON "WebhookLog"("success", "nextRetryAt", "retryCount");

-- AlterTable: Make OrderItem.productId optional (was NOT NULL, now nullable for SetNull on delete)
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable: Make QuoteItem.productId optional (was NOT NULL, now nullable for SetNull on delete)
ALTER TABLE "QuoteItem" ALTER COLUMN "productId" DROP NOT NULL;

-- Update foreign key constraints to ON DELETE SET NULL (was RESTRICT)
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuoteItem" DROP CONSTRAINT "QuoteItem_productId_fkey";
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
