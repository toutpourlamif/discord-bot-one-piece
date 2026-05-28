ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
DROP TYPE "public"."rarity";--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('D', 'C', 'B', 'A', 'S', 'SS', 'X');--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";