CREATE TYPE "public"."rarity" AS ENUM('COMMON', 'RARE', 'VERY_RARE', 'LEGENDARY');--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMON' NOT NULL;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMON' NOT NULL;--> statement-breakpoint
ALTER TABLE "resource_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMON' NOT NULL;