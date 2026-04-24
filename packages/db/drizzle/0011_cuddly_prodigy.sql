CREATE TABLE "resource_instance" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resource_instance_quantity_non_negative" CHECK ("resource_instance"."quantity" >= 0)
);
--> statement-breakpoint
DROP TABLE "character_template" CASCADE;--> statement-breakpoint
ALTER TABLE "resource_instance" ADD CONSTRAINT "resource_instance_template_id_resource_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."resource_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_instance" ADD CONSTRAINT "resource_instance_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "resource_instance_player_template_uniq" ON "resource_instance" USING btree ("player_id","template_id");