/*
  Warnings:

  - The values [EXPIRING_7_DAYS,EXPIRING_3_DAYS] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `error_msg` on the `notification_logs` table. All the data in the column will be lost.
  - You are about to drop the column `success` on the `notification_logs` table. All the data in the column will be lost.
  - Added the required column `channel` to the `notification_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `notification_logs` table without a default value. This is not possible if the table is not empty.
  - Made the column `member_id` on table `notification_logs` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Channel" AS ENUM ('TELEGRAM', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('WELCOME', 'EXPIRING_SOON', 'EXPIRED');
ALTER TABLE "notification_logs" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "gyms" ADD COLUMN     "telegram_bot_username" TEXT;

-- AlterTable
ALTER TABLE "notification_logs" DROP COLUMN "error_msg",
DROP COLUMN "success",
ADD COLUMN     "channel" "Channel" NOT NULL,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "status" "NotificationStatus" NOT NULL,
ALTER COLUMN "member_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
