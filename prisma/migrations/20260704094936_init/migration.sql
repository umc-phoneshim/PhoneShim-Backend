-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SocialProvider" AS ENUM ('GOOGLE', 'KAKAO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'WITHDRAWAL_PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "RestrictMode" AS ENUM ('NONE', 'FULL_PHONE', 'SPECIFIC_APP');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profile_image" TEXT,
    "motivation" VARCHAR(100),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "withdrawal_requested_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "SocialProvider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "total_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_minutes" INTEGER NOT NULL,
    "restrict_after" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "total_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitored_apps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "package_name" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,
    "app_icon" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monitored_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_goals" (
    "id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "target_minutes" INTEGER NOT NULL,
    "target_count" INTEGER NOT NULL,
    "restrict_after" BOOLEAN NOT NULL DEFAULT false,
    "goal_reason" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "used_minutes" INTEGER NOT NULL,
    "entry_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_reasons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "usage_log_id" UUID,
    "date" DATE NOT NULL,
    "time_range_start" TIMESTAMP(3) NOT NULL,
    "time_range_end" TIMESTAMP(3) NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "restrict_mode" "RestrictMode" NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_restricted_apps" (
    "reminder_id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,

    CONSTRAINT "reminder_restricted_apps_pkey" PRIMARY KEY ("reminder_id","monitored_app_id")
);

-- CreateTable
CREATE TABLE "alert_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "alert_time_minutes" INTEGER NOT NULL DEFAULT 1320,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "social_accounts_user_id_idx" ON "social_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_provider_provider_user_id_key" ON "social_accounts"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "total_goals_user_id_key" ON "total_goals"("user_id");

-- CreateIndex
CREATE INDEX "monitored_apps_user_id_sort_order_idx" ON "monitored_apps"("user_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "monitored_apps_user_id_package_name_key" ON "monitored_apps"("user_id", "package_name");

-- CreateIndex
CREATE UNIQUE INDEX "app_goals_monitored_app_id_key" ON "app_goals"("monitored_app_id");

-- CreateIndex
CREATE INDEX "usage_logs_user_id_date_idx" ON "usage_logs"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_logs_user_id_monitored_app_id_date_key" ON "usage_logs"("user_id", "monitored_app_id", "date");

-- CreateIndex
CREATE INDEX "usage_reasons_user_id_date_idx" ON "usage_reasons"("user_id", "date");

-- CreateIndex
CREATE INDEX "reminders_user_id_date_start_time_idx" ON "reminders"("user_id", "date", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "alert_settings_user_id_key" ON "alert_settings"("user_id");

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "total_goals" ADD CONSTRAINT "total_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitored_apps" ADD CONSTRAINT "monitored_apps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_goals" ADD CONSTRAINT "app_goals_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_reasons" ADD CONSTRAINT "usage_reasons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_reasons" ADD CONSTRAINT "usage_reasons_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_reasons" ADD CONSTRAINT "usage_reasons_usage_log_id_fkey" FOREIGN KEY ("usage_log_id") REFERENCES "usage_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_restricted_apps" ADD CONSTRAINT "reminder_restricted_apps_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_restricted_apps" ADD CONSTRAINT "reminder_restricted_apps_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_settings" ADD CONSTRAINT "alert_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
