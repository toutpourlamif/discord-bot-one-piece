CREATE TABLE "guild" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"language" varchar(8) DEFAULT 'fr' NOT NULL,
	"prefix" varchar(8) DEFAULT '!' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
