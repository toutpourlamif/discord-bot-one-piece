ALTER TABLE "history" RENAME COLUMN "kind" TO "type";--> statement-breakpoint
DROP INDEX "history_kind_occurred_at_idx";--> statement-breakpoint
DROP INDEX "history_actor_kind_bucket_uniq";--> statement-breakpoint
CREATE INDEX "history_type_occurred_at_idx" ON "history" USING btree ("type","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "history_actor_type_bucket_uniq" ON "history" USING btree ("actor_player_id","type","bucket_id") WHERE "history"."actor_player_id" IS NOT NULL AND "history"."bucket_id" IS NOT NULL;