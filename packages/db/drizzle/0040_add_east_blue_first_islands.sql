ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DEFAULT 'dawn_goa_kingdom'::text;--> statement-breakpoint
DROP TYPE "public"."sub_zone";--> statement-breakpoint
CREATE TYPE "public"."sub_zone" AS ENUM('satsuruzo_port', 'dawn_goa_kingdom', 'dawn_foosha_village', 'goat_island_coast', 'yotsuba_shells_town', 'yotsuba_shimotsuki_village', 'loguetown_square', 'reverse_mountain_twin_cape', 'whisky_peak_town', 'little_garden_jungle', 'drum_village', 'alabasta_nanohana', 'wano_flower_capital');--> statement-breakpoint
UPDATE "player" SET "current_sub_zone" = 'dawn_foosha_village' WHERE "current_sub_zone" = 'foosha_village';--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DEFAULT 'dawn_goa_kingdom'::"public"."sub_zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DATA TYPE "public"."sub_zone" USING "current_sub_zone"::"public"."sub_zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn_island'::text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."zone";--> statement-breakpoint
CREATE TYPE "public"."zone" AS ENUM('satsuruzo_kingdom', 'dawn_island', 'goat_island', 'yotsuba_island', 'loguetown', 'reverse_mountain', 'whisky_peak', 'little_garden', 'drum', 'alabasta', 'wano', 'sea_east_blue', 'sea_paradise', 'sea_new_world');--> statement-breakpoint
UPDATE "player" SET "current_zone" = 'dawn_island' WHERE "current_zone" = 'foosha';--> statement-breakpoint
UPDATE "player" SET "travel_target_zone" = 'dawn_island' WHERE "travel_target_zone" = 'foosha';--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn_island'::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE "public"."zone" USING "current_zone"::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE "public"."zone" USING "travel_target_zone"::"public"."zone";
