-- AlterTable: Hacer campos opcionales
ALTER TABLE "memberships"
  ALTER COLUMN "member_id" DROP NOT NULL,
  ALTER COLUMN "amount_paid" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "pricing_plan_id" TEXT,
  ADD COLUMN IF NOT EXISTS "total_amount" DOUBLE PRECISION;

-- CreateTable: membership_members
CREATE TABLE IF NOT EXISTS "membership_members" (
    "id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "price_applied" DOUBLE PRECISION NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_members_pkey" PRIMARY KEY ("id")
);

-- Migrar datos existentes
INSERT INTO "membership_members" (
    "id",
    "gym_id",
    "membership_id",
    "member_id",
    "price_applied",
    "is_primary",
    "created_at"
)
SELECT
    gen_random_uuid(),
    "gym_id",
    "id" as membership_id,
    "member_id",
    COALESCE("amount_paid", 0) as price_applied,
    true as is_primary,
    "created_at"
FROM "memberships"
WHERE "member_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Actualizar total_amount
UPDATE "memberships"
SET "total_amount" = "amount_paid"
WHERE "total_amount" IS NULL AND "amount_paid" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "membership_members_membership_id_member_id_key" ON "membership_members"("membership_id", "member_id");
CREATE INDEX IF NOT EXISTS "membership_members_gym_id_idx" ON "membership_members"("gym_id");
CREATE INDEX IF NOT EXISTS "membership_members_membership_id_idx" ON "membership_members"("membership_id");
CREATE INDEX IF NOT EXISTS "membership_members_member_id_idx" ON "membership_members"("member_id");
CREATE INDEX IF NOT EXISTS "membership_members_is_primary_idx" ON "membership_members"("is_primary");
CREATE INDEX IF NOT EXISTS "memberships_pricing_plan_id_idx" ON "memberships"("pricing_plan_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'membership_members_gym_id_fkey'
    ) THEN
        ALTER TABLE "membership_members" ADD CONSTRAINT "membership_members_gym_id_fkey"
            FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'membership_members_membership_id_fkey'
    ) THEN
        ALTER TABLE "membership_members" ADD CONSTRAINT "membership_members_membership_id_fkey"
            FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'membership_members_member_id_fkey'
    ) THEN
        ALTER TABLE "membership_members" ADD CONSTRAINT "membership_members_member_id_fkey"
            FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'memberships_pricing_plan_id_fkey'
    ) THEN
        ALTER TABLE "memberships" ADD CONSTRAINT "memberships_pricing_plan_id_fkey"
            FOREIGN KEY ("pricing_plan_id") REFERENCES "pricing_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
