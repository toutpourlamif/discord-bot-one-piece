CREATE TABLE "event_instance" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"event_key" text NOT NULL,
	"is_interactive" boolean NOT NULL,
	"bucket_id" integer NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_instance" ADD CONSTRAINT "event_instance_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_instance_player_event_key_bucket_uniq" ON "event_instance" USING btree ("player_id","event_key","bucket_id");