ALTER TYPE "public"."devil_fruit_type" RENAME TO "pokemon_type";--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pokemon_type";--> statement-breakpoint
CREATE TYPE "public"."pokemon_type" AS ENUM('NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY');--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE "public"."pokemon_type"[] USING "types"::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DEFAULT '{}'::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "types" "pokemon_type"[] DEFAULT '{}'::"public"."pokemon_type"[] NOT NULL;
