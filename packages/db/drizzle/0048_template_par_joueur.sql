ALTER TABLE "character_template" DROP CONSTRAINT "character_template_name_unique";--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "player_id" integer;--> statement-breakpoint
ALTER TABLE "character_template" ADD CONSTRAINT "character_template_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "character_template_name_recruitable_uniq" ON "character_template" USING btree ("name") WHERE "character_template"."player_id" is null;--> statement-breakpoint
ALTER TABLE "character_instance" DROP COLUMN "nickname";