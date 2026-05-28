ALTER TYPE "public"."devil_fruit_type" RENAME TO "pokemon_type";--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "types" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[]::text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[]::text;--> statement-breakpoint
DROP TYPE "public"."pokemon_type";--> statement-breakpoint
CREATE TYPE "public"."pokemon_type" AS ENUM('NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY');--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[]::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "character_template" ALTER COLUMN "types" SET DATA TYPE "public"."pokemon_type"[] USING "types"::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[]::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE "public"."pokemon_type"[] USING "types"::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE "public"."pokemon_type"[] USING "types"::text::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[];--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "types" "pokemon_type"[] DEFAULT '{}'::pokemon_type[] NOT NULL;