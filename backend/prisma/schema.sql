-- ============================================
-- GymApp - PostgreSQL Database Schema (DDL)
-- ============================================
-- Generado desde Prisma Schema
-- Para Railway o cualquier PostgreSQL 12+
-- ============================================

-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECEPTIONIST', 'TRAINER');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM ('WELCOME', 'EXPIRING_SOON', 'EXPIRED');
CREATE TYPE "Channel" AS ENUM ('TELEGRAM', 'EMAIL', 'SMS');
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'FAILED');
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- ============================================
-- TABLAS
-- ============================================

-- Super Admin (gestiona toda la plataforma)
CREATE TABLE "super_admins" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Configuración global del SaaS
CREATE TABLE "saas_config" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "monthly_price" DECIMAL(10,2) NOT NULL DEFAULT 50.0,
    "trial_days" INTEGER NOT NULL DEFAULT 30,
    "max_members_per_plan" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Gimnasio (tenant)
CREATE TABLE "gyms" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "address" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "setup_completed" BOOLEAN NOT NULL DEFAULT false,
    "trial_ends_at" TIMESTAMP,
    "subscription_ends" TIMESTAMP,
    "telegram_bot_token" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Usuario del gym (admin, recepcionista, entrenador)
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_users_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "unique_gym_email" UNIQUE ("gym_id", "email")
);

-- Cliente/Member del gym
CREATE TABLE "members" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50) NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "emergency_contact" VARCHAR(255),
    "photo_url" TEXT,
    "telegram_chat_id" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_members_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "unique_gym_phone" UNIQUE ("gym_id", "phone")
);

-- Disciplina (Gym, Crossfit, Funcional, etc.)
CREATE TABLE "disciplines" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_disciplines_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "unique_gym_discipline" UNIQUE ("gym_id", "name")
);

-- Plan de precios
CREATE TABLE "pricing_plans" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "discipline_id" UUID NOT NULL,
    "num_people" INTEGER NOT NULL,
    "num_months" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_pricing_plans_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_pricing_plans_discipline" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE CASCADE,
    CONSTRAINT "unique_pricing_plan" UNIQUE ("gym_id", "discipline_id", "num_people", "num_months")
);

-- Membresía (inscripción/pago)
CREATE TABLE "memberships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "discipline_id" UUID NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "payment_method" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_memberships_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_memberships_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_memberships_discipline" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE CASCADE
);

-- Asistencia (check-in por QR)
CREATE TABLE "attendances" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "checked_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "fk_attendances_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_attendances_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE
);

-- Log de notificaciones enviadas
CREATE TABLE "notification_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "Channel" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "sent_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    CONSTRAINT "fk_notification_logs_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_notification_logs_member" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE
);

-- Factura mensual del gym (SaaS billing)
CREATE TABLE "gym_invoices" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gym_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_at" TIMESTAMP,
    "payment_method" VARCHAR(100),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_gym_invoices_gym" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES (Para optimizar queries)
-- ============================================

-- Índices para gyms
CREATE INDEX "idx_gyms_slug" ON "gyms"("slug");
CREATE INDEX "idx_gyms_is_active" ON "gyms"("is_active");

-- Índices para users
CREATE INDEX "idx_users_gym_id" ON "users"("gym_id");
CREATE INDEX "idx_users_email" ON "users"("email");

-- Índices para members
CREATE INDEX "idx_members_gym_id" ON "members"("gym_id");
CREATE INDEX "idx_members_code" ON "members"("code");
CREATE INDEX "idx_members_phone" ON "members"("phone");
CREATE INDEX "idx_members_is_active" ON "members"("is_active");

-- Índices para disciplines
CREATE INDEX "idx_disciplines_gym_id" ON "disciplines"("gym_id");
CREATE INDEX "idx_disciplines_is_active" ON "disciplines"("is_active");

-- Índices para pricing_plans
CREATE INDEX "idx_pricing_plans_gym_id" ON "pricing_plans"("gym_id");
CREATE INDEX "idx_pricing_plans_discipline_id" ON "pricing_plans"("discipline_id");

-- Índices para memberships
CREATE INDEX "idx_memberships_gym_id" ON "memberships"("gym_id");
CREATE INDEX "idx_memberships_member_id" ON "memberships"("member_id");
CREATE INDEX "idx_memberships_discipline_id" ON "memberships"("discipline_id");
CREATE INDEX "idx_memberships_status" ON "memberships"("status");
CREATE INDEX "idx_memberships_end_date" ON "memberships"("end_date");

-- Índices para attendances
CREATE INDEX "idx_attendances_gym_id" ON "attendances"("gym_id");
CREATE INDEX "idx_attendances_member_id" ON "attendances"("member_id");
CREATE INDEX "idx_attendances_checked_at" ON "attendances"("checked_at");

-- Índices para notification_logs
CREATE INDEX "idx_notification_logs_gym_id" ON "notification_logs"("gym_id");
CREATE INDEX "idx_notification_logs_member_id" ON "notification_logs"("member_id");
CREATE INDEX "idx_notification_logs_sent_at" ON "notification_logs"("sent_at");

-- Índices para gym_invoices
CREATE INDEX "idx_gym_invoices_gym_id" ON "gym_invoices"("gym_id");
CREATE INDEX "idx_gym_invoices_status" ON "gym_invoices"("status");
CREATE INDEX "idx_gym_invoices_due_date" ON "gym_invoices"("due_date");

-- ============================================
-- TRIGGERS para updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_super_admins_updated_at BEFORE UPDATE ON "super_admins" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saas_config_updated_at BEFORE UPDATE ON "saas_config" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON "gyms" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON "members" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_disciplines_updated_at BEFORE UPDATE ON "disciplines" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON "pricing_plans" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON "memberships" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gym_invoices_updated_at BEFORE UPDATE ON "gym_invoices" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar configuración SaaS por defecto
INSERT INTO "saas_config" ("id", "monthly_price", "trial_days", "max_members_per_plan")
VALUES (uuid_generate_v4(), 50.0, 30, 100)
ON CONFLICT DO NOTHING;

-- Super Admin por defecto (cambiar password en producción!)
-- Password: admin123 (hasheado con bcrypt)
INSERT INTO "super_admins" ("id", "email", "password", "name")
VALUES (
    uuid_generate_v4(),
    'admin@gymapp.com',
    '$2b$10$YourHashedPasswordHere',  -- ⚠️ CAMBIAR EN PRODUCCIÓN
    'Super Admin'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
-- Total de tablas: 12
-- Total de ENUMs: 6
-- Total de índices: ~25
-- ============================================
