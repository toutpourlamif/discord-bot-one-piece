CREATE TABLE "character_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"hp" integer DEFAULT 100 NOT NULL,
	"combat" integer DEFAULT 10 NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_template_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE INDEX "character_template_name_trgm_idx" ON "character_template" USING gin ("name" gin_trgm_ops);