CREATE TYPE "public"."rarity" AS ENUM('COMMUN', 'RARE', 'TRES_RARE', 'LEGENDAIRE');--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMUN' NOT NULL;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMUN' NOT NULL;--> statement-breakpoint
ALTER TABLE "resource_template" ADD COLUMN "rarity" "rarity" DEFAULT 'COMMUN' NOT NULL;