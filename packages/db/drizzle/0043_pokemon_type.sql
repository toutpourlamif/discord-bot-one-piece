CREATE TYPE "public"."pokemon_type" AS ENUM('NORMAL', 'FIRE', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 'FLYING', 'PSYCHIC', 'BUG', 'ROCK', 'GHOST', 'DRAGON', 'DARK', 'STEEL', 'FAIRY');--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DATA TYPE "public"."pokemon_type"[] USING array_remove(array_remove(array_remove(array_remove(array_remove(array_remove(array_replace(array_replace(array_replace(array_replace(array_replace(array_replace("types"::text[], 'FEU', 'FIRE'), 'GLACE', 'ICE'), 'TENEBRES', 'DARK'), 'ACIER', 'STEEL'), 'ELECTRIQUE', 'ELECTRIC'), 'PSY', 'PSYCHIC'), 'MAGMA'), 'FOUDRE'), 'LUMIERE'), 'SABLE'), 'GAZ'), 'CAOUTCHOUC')::"public"."pokemon_type"[];--> statement-breakpoint
ALTER TABLE "devil_fruit_template" ALTER COLUMN "types" SET DEFAULT '{}'::pokemon_type[];--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "types" "pokemon_type"[] DEFAULT '{}'::pokemon_type[] NOT NULL;--> statement-breakpoint
DROP TYPE "public"."devil_fruit_type";
