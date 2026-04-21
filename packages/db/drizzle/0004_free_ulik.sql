CREATE TYPE "public"."devil_fruit_type" AS ENUM('FEU', 'GLACE', 'MAGMA', 'FOUDRE', 'TENEBRES', 'LUMIERE', 'SABLE', 'GAZ', 'CAOUTCHOUC', 'POISON');--> statement-breakpoint
CREATE TABLE "devil_fruit_instance" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devil_fruit_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"types" "devil_fruit_type"[] DEFAULT '{}'::devil_fruit_type[] NOT NULL,
	"hp_bonus" integer DEFAULT 0 NOT NULL,
	"combat_bonus" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "devil_fruit_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "devil_fruit_instance" ADD CONSTRAINT "devil_fruit_instance_template_id_devil_fruit_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."devil_fruit_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devil_fruit_instance" ADD CONSTRAINT "devil_fruit_instance_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "devil_fruit_instance_player_template_uniq" ON "devil_fruit_instance" USING btree ("player_id","template_id");--> statement-breakpoint
CREATE INDEX "devil_fruit_template_name_trgm_idx" ON "devil_fruit_template" USING gin ("name" gin_trgm_ops);