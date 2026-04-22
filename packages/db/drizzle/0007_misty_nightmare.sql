CREATE TABLE "resource_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"image_url" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
