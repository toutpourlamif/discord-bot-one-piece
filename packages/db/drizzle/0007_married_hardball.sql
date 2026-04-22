CREATE TABLE "ship" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"hull_level" integer DEFAULT 1 NOT NULL,
	"sail_level" integer DEFAULT 1 NOT NULL,
	"decks_level" integer DEFAULT 1 NOT NULL,
	"cabins_level" integer DEFAULT 1 NOT NULL,
	"cargo_level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ship_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
ALTER TABLE "ship" ADD CONSTRAINT "ship_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;