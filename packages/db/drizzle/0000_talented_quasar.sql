CREATE TABLE "player" (
	"id" serial PRIMARY KEY NOT NULL,
	"discord_id" varchar(32) NOT NULL,
	"name" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_discord_id_unique" UNIQUE("discord_id")
);
