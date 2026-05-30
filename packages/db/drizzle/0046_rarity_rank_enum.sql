ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::text;--> statement-breakpoint
UPDATE "character_template" SET "rarity" = CASE "rarity" WHEN 'COMMON' THEN 'D' WHEN 'RARE' THEN 'C' WHEN 'VERY_RARE' THEN 'B' WHEN 'LEGENDARY' THEN 'A' ELSE "rarity" END;--> statement-breakpoint
UPDATE "character_template" SET "rarity" = 'S' WHERE "name" IN ('Dracule Mihawk', 'Marshall D. Teach');--> statement-breakpoint
UPDATE "devil_fruit_template" SET "rarity" = CASE "rarity" WHEN 'COMMON' THEN 'D' WHEN 'RARE' THEN 'C' WHEN 'VERY_RARE' THEN 'B' WHEN 'LEGENDARY' THEN 'A' ELSE "rarity" END;--> statement-breakpoint
UPDATE "resource_template" SET "rarity" = CASE "rarity" WHEN 'COMMON' THEN 'D' WHEN 'RARE' THEN 'C' WHEN 'VERY_RARE' THEN 'B' WHEN 'LEGENDARY' THEN 'A' ELSE "rarity" END;--> statement-breakpoint
DROP TYPE "public"."rarity";--> statement-breakpoint
CREATE TYPE "public"."rarity" AS ENUM('D', 'C', 'B', 'A', 'S', 'SS', 'X');--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DEFAULT 'D'::"public"."rarity";--> statement-breakpoint
ALTER TABLE "resource_template" ALTER COLUMN "rarity" SET DATA TYPE "public"."rarity" USING "rarity"::"public"."rarity";
