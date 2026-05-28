CREATE TYPE "public"."onboarding_step" AS ENUM('intro', 'fish-mission', 'after-fish');--> statement-breakpoint
ALTER TABLE "player" ADD COLUMN "onboarding_step" "onboarding_step" DEFAULT 'intro';