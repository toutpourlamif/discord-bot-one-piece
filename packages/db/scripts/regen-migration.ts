/**
 * Rebase la migration en cours sur origin/<base> quand son numéro est déjà pris.
 *
 * Drizzle numérote les migrations à la génération : deux branches parties du
 * même point génèrent le même `00XX`. On remet `drizzle/` à l'état de la base
 * puis on régénère la migration depuis `schema.ts` — qui doit déjà contenir les
 * changements de la base (merge/rebase fait avant).
 *
 * Usage : pnpm --filter @one-piece/db regen [--name=ma_migration] [--base=main]
 */
import { spawnSync } from 'child_process';
import { readdirSync, rmSync } from 'fs';
import { join } from 'path';

import chalk from 'chalk';

// Le script vit dans packages/db/scripts/ ; dbDir = packages/db.
const dbDir = join(import.meta.dirname, '..');
const drizzleDir = join(dbDir, 'drizzle');

function git(args: Array<string>): string {
  const result = spawnSync('git', args, { cwd: dbDir, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`\`git ${args.join(' ')}\` a échoué :\n${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function runDrizzleKit(args: Array<string>, errorMessage: string): void {
  const result = spawnSync('drizzle-kit', args, { cwd: dbDir, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(errorMessage);
}

function migrationCount(): number {
  return readdirSync(drizzleDir).filter((file) => file.endsWith('.sql')).length;
}

function main(): void {
  const args = process.argv.slice(2);
  const name = args.find((arg) => arg.startsWith('--name='))?.slice('--name='.length);
  const base = args.find((arg) => arg.startsWith('--base='))?.slice('--base='.length) ?? 'main';
  const ref = `origin/${base}`;

  console.log(chalk.bold(`\n🔄 regen-migration — rebase la migration sur ${ref}\n`));

  git(['fetch', 'origin', base, '--quiet']);

  // Sans ça, la migration régénérée annulerait le schéma de ${base}.
  if (spawnSync('git', ['merge-base', '--is-ancestor', ref, 'HEAD'], { cwd: dbDir }).status !== 0) {
    throw new Error(`${ref} n'est pas dans ta branche — \`git merge ${ref}\` (et résous schema.ts) d'abord.`);
  }
  // drizzle/ va être écrasé : on exige qu'il soit committé (donc récupérable).
  if (git(['status', '--porcelain', 'drizzle']) !== '') {
    throw new Error('drizzle/ a des changements non commités — commit-les avant de régénérer.');
  }

  // Reset total : drizzle/ devient identique à la base, pas de tri fichier par fichier.
  rmSync(drizzleDir, { recursive: true, force: true });
  git(['checkout', ref, '--', 'drizzle']);
  git(['reset', '--quiet', '--', 'drizzle']); // déstage : laisse un diff propre à relire
  console.log(`${chalk.green('✓')} drizzle/ remis à l'état de ${ref}`);

  // `drizzle-kit generate` sort en code 0 même chaîne de snapshots cassée ;
  // `check` (lui) échoue franchement — on valide la base avant, le résultat après.
  runDrizzleKit(['check'], `${ref} a une chaîne de migrations cassée — répare ${base} d'abord.`);

  const before = migrationCount();
  runDrizzleKit(name ? ['generate', `--name=${name}`] : ['generate'], '`drizzle-kit generate` a échoué.');
  if (migrationCount() === before) {
    console.log(chalk.yellow(`\nAucun changement : schema.ts est déjà aligné sur ${ref}.`));
    return;
  }

  runDrizzleKit(['check'], 'la migration régénérée est incohérente.');
  console.log(chalk.bold.green('\n✓ migration régénérée.'));
  console.log(chalk.cyan('Relis le .sql, puis reset ta DB locale (le hash a changé).'));
}

try {
  main();
} catch (error) {
  console.error(chalk.red(`\n✖ ${error instanceof Error ? error.message : String(error)}`));
  process.exitCode = 1;
}
