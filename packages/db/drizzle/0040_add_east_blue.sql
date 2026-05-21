ALTER TYPE "public"."sub_zone" ADD VALUE 'satsuruzo_port' BEFORE 'foosha_village';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'goa_kingdom' BEFORE 'foosha_village';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'shells_town' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'shimotsuki_village' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'mirrorball_coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'nagagutsu_port' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'orange_town' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'rare_animal_coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'kumate_coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'sixis_coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'tequila_wolf_coast' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'syrup_village' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'baratie_deck' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'arlong_park' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'cocoyasi_village' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'gosa_town' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'branch_16' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'cozia_port' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'frauce_port' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TYPE "public"."sub_zone" ADD VALUE 'oykot_port' BEFORE 'loguetown_square';--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn'::text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."zone";--> statement-breakpoint
CREATE TYPE "public"."zone" AS ENUM('satsuruzo', 'dawn', 'goat', 'yotsuba', 'mirrorball', 'nagagutsu', 'organ', 'rare_animal', 'kumate', 'sixis', 'tequila_wolf', 'gecko', 'baratie', 'conomi', 'cozia', 'frauce', 'oykot', 'pole_star', 'reverse_mountain', 'whisky_peak', 'little_garden', 'drum', 'alabasta', 'wano', 'sea_east_blue', 'sea_paradise', 'sea_new_world');--> statement-breakpoint
UPDATE "player" SET "current_zone" = 'dawn' WHERE "current_zone" = 'foosha';--> statement-breakpoint
UPDATE "player" SET "travel_target_zone" = 'dawn' WHERE "travel_target_zone" = 'foosha';--> statement-breakpoint
UPDATE "player" SET "current_zone" = 'pole_star' WHERE "current_zone" = 'loguetown';--> statement-breakpoint
UPDATE "player" SET "travel_target_zone" = 'pole_star' WHERE "travel_target_zone" = 'loguetown';--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn'::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE "public"."zone" USING "current_zone"::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE "public"."zone" USING "travel_target_zone"::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DEFAULT 'goa_kingdom';
