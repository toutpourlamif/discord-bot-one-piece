CREATE TABLE "character_instance" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_instance" ADD CONSTRAINT "character_instance_template_id_character_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."character_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_instance" ADD CONSTRAINT "character_instance_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "character_instance_player_template_uniq" ON "character_instance" USING btree ("player_id","template_id");