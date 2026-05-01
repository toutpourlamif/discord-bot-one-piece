CREATE TABLE "history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" text NOT NULL,
	"actor_player_id" integer,
	"target_type" text,
	"target_id" integer,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"source" text
);
--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_actor_player_id_player_id_fk" FOREIGN KEY ("actor_player_id") REFERENCES "public"."player"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "history_occurred_at_idx" ON "history" USING btree ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "history_event_type_occurred_at_idx" ON "history" USING btree ("event_type","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "history_actor_player_id_occurred_at_idx" ON "history" USING btree ("actor_player_id","occurred_at" DESC NULLS LAST) WHERE "history"."actor_player_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "history_target_idx" ON "history" USING btree ("target_type","target_id") WHERE "history"."target_id" IS NOT NULL;