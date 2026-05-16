ALTER TABLE "history" RENAME COLUMN "event_type" TO "kind";--> statement-breakpoint
DROP INDEX "history_event_type_occurred_at_idx";--> statement-breakpoint
DROP INDEX "history_actor_event_bucket_uniq";--> statement-breakpoint
CREATE INDEX "history_kind_occurred_at_idx" ON "history" USING btree ("kind","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "history_actor_kind_bucket_uniq" ON "history" USING btree ("actor_player_id","kind","bucket_id") WHERE "history"."actor_player_id" IS NOT NULL AND "history"."bucket_id" IS NOT NULL;