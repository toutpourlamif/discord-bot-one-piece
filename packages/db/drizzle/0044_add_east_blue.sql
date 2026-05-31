ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn'::text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."zone";--> statement-breakpoint
DROP TYPE "public"."sub_zone";--> statement-breakpoint
CREATE TYPE "public"."zone" AS ENUM('satsuruzo', 'dawn', 'goat', 'yotsuba', 'mirrorball', 'nagagutsu', 'organ', 'rare_animal', 'kumate', 'sixis', 'tequila_wolf', 'gecko', 'baratie', 'conomi', 'cozia', 'frauce', 'oykot', 'pole_star', 'reverse_mountain', 'whisky_peak', 'little_garden', 'drum', 'alabasta', 'wano', 'sea_east_blue', 'sea_paradise', 'sea_new_world');--> statement-breakpoint
CREATE TYPE "public"."sub_zone" AS ENUM('satsuruzo_port', 'goa_kingdom', 'foosha_village', 'goat_coast', 'shells_town', 'shimotsuki_village', 'mirrorball_coast', 'nagagutsu_port', 'orange_town', 'rare_animal_coast', 'kumate_coast', 'sixis_coast', 'tequila_wolf_coast', 'syrup_village', 'baratie_deck', 'arlong_park', 'cocoyasi_village', 'gosa_town', 'branch_16', 'cozia_port', 'frauce_port', 'oykot_port', 'loguetown_square', 'reverse_mountain_twin_cape', 'whisky_peak_town', 'little_garden_jungle', 'drum_village', 'alabasta_nanohana', 'wano_flower_capital');--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DEFAULT 'dawn'::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_zone" SET DATA TYPE "public"."zone" USING "current_zone"::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "travel_target_zone" SET DATA TYPE "public"."zone" USING "travel_target_zone"::"public"."zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DEFAULT 'goa_kingdom'::"public"."sub_zone";--> statement-breakpoint
ALTER TABLE "player" ALTER COLUMN "current_sub_zone" SET DATA TYPE "public"."sub_zone" USING "current_sub_zone"::"public"."sub_zone";
