-- CreateTable
CREATE TABLE "usage_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monitored_app_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_sessions_user_id_date_idx" ON "usage_sessions"("user_id", "date");

-- AddForeignKey
ALTER TABLE "usage_sessions" ADD CONSTRAINT "usage_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_sessions" ADD CONSTRAINT "usage_sessions_monitored_app_id_fkey" FOREIGN KEY ("monitored_app_id") REFERENCES "monitored_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
