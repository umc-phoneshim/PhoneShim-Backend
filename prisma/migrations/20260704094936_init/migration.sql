-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'KAKAO');

-- CreateEnum
CREATE TYPE "RestrictMode" AS ENUM ('NONE', 'FULL_PHONE', 'SPECIFIC_APP');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "profile_image" TEXT,
    "withdrawal_requested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "app_name" TEXT NOT NULL,
    "app_icon" TEXT,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitored_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_goals" (
    "id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "target_minutes" INTEGER NOT NULL,
    "target_count" INTEGER NOT NULL,
    "restrict_after" BOOLEAN NOT NULL DEFAULT false,
    "goal_reason" TEXT,
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
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "used_minutes" INTEGER NOT NULL,
    "entry_count" INTEGER NOT NULL,

    CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "usage_reasons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "time_range_start" TIMESTAMP(3) NOT NULL,
    "time_range_end" TIMESTAMP(3) NOT NULL,
    "reason" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "alert_time" TEXT NOT NULL DEFAULT '22:00',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "total_goals_user_id_key" ON "total_goals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "app_goals_monitored_app_id_key" ON "app_goals"("monitored_app_id");

-- CreateIndex
CREATE INDEX "usage_logs_user_id_date_idx" ON "usage_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "reminders_user_id_date_idx" ON "reminders"("user_id", "date");

-- CreateIndex
CREATE INDEX "usage_reasons_user_id_date_idx" ON "usage_reasons"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "alert_settings_user_id_key" ON "alert_settings"("user_id");

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
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_restricted_apps" ADD CONSTRAINT "reminder_restricted_apps_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_restricted_apps" ADD CONSTRAINT "reminder_restricted_apps_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_reasons" ADD CONSTRAINT "usage_reasons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_reasons" ADD CONSTRAINT "usage_reasons_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_settings" ADD CONSTRAINT "alert_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
