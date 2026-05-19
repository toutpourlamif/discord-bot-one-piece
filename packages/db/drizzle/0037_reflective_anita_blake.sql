CREATE TYPE "public"."language" AS ENUM('fr', 'en');--> statement-breakpoint
ALTER TABLE "guild" ALTER COLUMN "language" SET DEFAULT 'fr'::"public"."language";--> statement-breakpoint
ALTER TABLE "guild" ALTER COLUMN "language" SET DATA TYPE "public"."language" USING "language"::"public"."language";