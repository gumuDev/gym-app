-- ============================================
-- MIGRACIÓN CORREGIDA PARA RAILWAY (con UUID)
-- ============================================

-- Paso 1: Hacer columnas opcionales en memberships
ALTER TABLE "memberships"
  ALTER COLUMN "member_id" DROP NOT NULL,
  ALTER COLUMN "amount_paid" DROP NOT NULL;

-- Paso 2: Agregar nuevas columnas
ALTER TABLE "memberships"
  ADD COLUMN IF NOT EXISTS "pricing_plan_id" UUID,
  ADD COLUMN IF NOT EXISTS "total_amount" DOUBLE PRECISION;

-- Paso 3: Crear tabla membership_members (usando UUID)
CREATE TABLE IF NOT EXISTS "membership_members" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "price_applied" DOUBLE PRECISION NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_members_pkey" PRIMARY KEY ("id")
);

-- Paso 4: Migrar datos existentes
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
    uuid_generate_v4(),
    "gym_id",
    "id" as membership_id,
    "member_id",
    COALESCE("amount_paid", 0) as price_applied,
    true as is_primary,
    "created_at"
FROM "memberships"
WHERE "member_id" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Paso 5: Actualizar total_amount
UPDATE "memberships"
SET "total_amount" = "amount_paid"
WHERE "total_amount" IS NULL AND "amount_paid" IS NOT NULL;

-- Paso 6: Crear índices
CREATE UNIQUE INDEX IF NOT EXISTS "membership_members_membership_id_member_id_key" ON "membership_members"("membership_id", "member_id");
CREATE INDEX IF NOT EXISTS "membership_members_gym_id_idx" ON "membership_members"("gym_id");
CREATE INDEX IF NOT EXISTS "membership_members_membership_id_idx" ON "membership_members"("membership_id");
CREATE INDEX IF NOT EXISTS "membership_members_member_id_idx" ON "membership_members"("member_id");
CREATE INDEX IF NOT EXISTS "membership_members_is_primary_idx" ON "membership_members"("is_primary");
CREATE INDEX IF NOT EXISTS "memberships_pricing_plan_id_idx" ON "memberships"("pricing_plan_id");

-- Paso 7: Agregar foreign keys (usando DO bloques para IF NOT EXISTS)
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

-- Paso 8: Registrar migración en Prisma
INSERT INTO "_prisma_migrations" (
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
) VALUES (
  uuid_generate_v4(),
  'MANUAL_MIGRATION',
  NOW(),
  '20260129161554_add_group_memberships',
  NULL,
  NULL,
  NOW(),
  1
) ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Migración completada exitosamente' as status;
SELECT COUNT(*) as "Memberships migradas" FROM membership_members;
