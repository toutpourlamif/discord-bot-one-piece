CREATE TYPE "character_skill" AS ENUM('MASON', 'SUPER_MASON', 'NAVIGATOR', 'CONQUERORS_HAKI', 'ARCHAEOLOGIST');
ALTER TABLE "character_template" ADD COLUMN "skill" character_skill[];