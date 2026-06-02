ALTER TABLE "character_template" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "character_template" ADD COLUMN "player_id" integer;--> statement-breakpoint
ALTER TABLE "character_template" ADD CONSTRAINT "character_template_player_id_player_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Reprise des joueurs existants : chacun pointait vers le template partagé "PLAYER_AS_CHARACTER".
-- On crée un template perso (copie des stats) par instance rattachée, on repointe l'instance, puis on supprime le template partagé.
-- L'unicité (player_id, template_id) sur character_instance garantit au plus une instance "player as character" par joueur,
-- donc player_id identifie sans ambiguïté le nouveau template lors du repointage.
INSERT INTO "character_template" ("player_id", "name", "description", "hp", "combat", "devil_fruit_template_id", "rarity", "captain_combat_multiplier", "captain_hp_multiplier", "captain_berry_gain_multiplier", "captain_karma_multiplier", "captain_morale_multiplier", "race", "types", "image_url", "skills")
SELECT ci."player_id", NULL, ct."description", ct."hp", ct."combat", ct."devil_fruit_template_id", ct."rarity", ct."captain_combat_multiplier", ct."captain_hp_multiplier", ct."captain_berry_gain_multiplier", ct."captain_karma_multiplier", ct."captain_morale_multiplier", ct."race", ct."types", ct."image_url", ct."skills"
FROM "character_instance" ci
JOIN "character_template" ct ON ci."template_id" = ct."id"
WHERE ct."name" = 'PLAYER_AS_CHARACTER';--> statement-breakpoint
UPDATE "character_instance" ci
SET "template_id" = nt."id"
FROM "character_template" nt, "character_template" shared
WHERE nt."player_id" = ci."player_id"
  AND shared."name" = 'PLAYER_AS_CHARACTER'
  AND ci."template_id" = shared."id";--> statement-breakpoint
DELETE FROM "character_template" WHERE "name" = 'PLAYER_AS_CHARACTER';