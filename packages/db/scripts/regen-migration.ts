/**
 * Régénère la migration Drizzle en cours par-dessus origin/<base>.
 *
 * Drizzle numérote les migrations à la génération : deux branches parties du
 * même point produisent le même `00XX`. Ce script :
 *   1. merge origin/<base> dans la branche (schema.ts récupère les changements
 *      de la base) ;
 *   2. remet drizzle/ à l'état de la base ;
 *   3. régénère la migration depuis schema.ts, en réutilisant le nom de la
 *      migration de la branche (`0037_foo` devient `0041_foo`).
 *
 * Le merge est automatique tant qu'il ne conflicte que dans drizzle/ (résolu en
 * prenant la base — drizzle/ est de toute façon régénéré). S'il conflicte
 * ailleurs (schema.ts…), le merge est annulé : fais-le à la main puis relance.
 *
 * Usage : pnpm --filter @one-piece/db regen [--name=ma_migration] [--base=main]
 */
import { spawnSync } from 'child_process';
import { readdirSync, rmSync } from 'fs';
import { basename, join } from 'path';

import chalk from 'chalk';

// Le script vit dans packages/db/scripts/ ; dbDir = packages/db.
const dbDir = join(import.meta.dirname, '..');
const drizzleDir = join(dbDir, 'drizzle');

function gitTry(args: Array<string>) {
  return spawnSync('git', args, { cwd: dbDir, encoding: 'utf8' });
}

function git(args: Array<string>): string {
  const result = gitTry(args);
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

/** Noms de fichiers `.sql` de drizzle/ présents dans `ref`. */
function migrationsAt(ref: string): Array<string> {
  return git(['ls-tree', '-r', '--name-only', ref, '--', 'drizzle'])
    .split('\n')
    .filter((path) => path.endsWith('.sql'))
    .map((path) => basename(path));
}

/** Nom de la migration de la branche absente de la base : `0037_foo.sql` donne `foo`. */
function pendingMigrationName(baseRef: string): string | undefined {
  const baseFiles = new Set(migrationsAt(baseRef));
  const pending = migrationsAt('HEAD')
    .filter((file) => !baseFiles.has(file))
    .sort(); // préfixe `00XX_` : tri lexical == tri numérique
  return pending
    .at(-1)
    ?.replace(/^\d+_/, '')
    .replace(/\.sql$/, '');
}

/** Remet drizzle/ à l'identique de `ref` (stagé). */
function resetDrizzleTo(ref: string): void {
  rmSync(drizzleDir, { recursive: true, force: true });
  git(['checkout', ref, '--', 'drizzle']);
}

/**
 * Merge `ref` dans la branche. Résout seul les conflits limités à drizzle/ ;
 * lève si le merge conflicte ailleurs (à résoudre à la main puis relancer).
 */
function mergeBase(ref: string): void {
  if (git(['status', '--porcelain', '--untracked-files=no']) !== '') {
    throw new Error(`Working tree pas clean — commit ou stash tes changements avant de merger ${ref}.`);
  }

  console.log(`${chalk.dim('…')} merge de ${ref}`);
  const merge = gitTry(['merge', ref, '--no-edit']);
  if (merge.status === 0) {
    console.log(`${chalk.green('✓')} ${ref} mergé`);
    return;
  }

  const conflicts = git(['diff', '--name-only', '--diff-filter=U']).split('\n').filter(Boolean);
  const drizzlePrefix = `${git(['rev-parse', '--show-prefix'])}drizzle/`;
  const outside = conflicts.filter((path) => !path.startsWith(drizzlePrefix));

  if (conflicts.length === 0 || outside.length > 0) {
    gitTry(['merge', '--abort']);
    const detail = conflicts.length === 0 ? merge.stderr.trim() : `Conflits hors de drizzle/ :\n  ${outside.join('\n  ')}`;
    throw new Error(
      `${detail}\nMerge de ${ref} pas automatisable. Fais \`git merge ${ref}\` à la main ` +
        `(résous schema.ts ; pour drizzle/ : \`git checkout ${ref} -- drizzle\`), commit, puis relance.`,
    );
  }

  // Conflits limités à drizzle/ : on prend la base, drizzle/ est régénéré juste après.
  resetDrizzleTo(ref);
  git(['add', '-A', '--', 'drizzle']);
  git(['commit', '--no-edit']);
  console.log(`${chalk.green('✓')} ${ref} mergé (conflits drizzle/ résolus sur la base)`);
}

function main(): void {
  const args = process.argv.slice(2);
  const explicitName = args.find((arg) => arg.startsWith('--name='))?.slice('--name='.length);
  const base = args.find((arg) => arg.startsWith('--base='))?.slice('--base='.length) ?? 'main';
  const ref = `origin/${base}`;

  console.log(chalk.bold(`\n🔄 regen-migration — régénère la migration sur ${ref}\n`));

  git(['fetch', 'origin', base, '--quiet']);

  // drizzle/ va être écrasé : on exige qu'il soit committé (donc récupérable).
  if (git(['status', '--porcelain', '--', 'drizzle']) !== '') {
    throw new Error('drizzle/ a des changements non commités — commit-les avant de régénérer.');
  }

  // Avant le merge : HEAD pointe encore sur la branche, donc on capte son nom.
  const name = explicitName ?? pendingMigrationName(ref);

  // Le merge donne à schema.ts les changements de la base ; sans lui la
  // migration régénérée annulerait le schéma de la base.
  if (gitTry(['merge-base', '--is-ancestor', ref, 'HEAD']).status !== 0) {
    mergeBase(ref);
  } else {
    console.log(`${chalk.green('✓')} ${ref} déjà dans la branche`);
  }

  // Reset total : drizzle/ devient identique à la base, pas de tri fichier par fichier.
  resetDrizzleTo(ref);
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
  console.log(chalk.bold.green(`\n✓ migration régénérée${name ? ` « ${name} »` : ''}.`));
  console.log(chalk.cyan('Relis le .sql, puis reset ta DB locale (le hash a changé).'));
}

try {
  main();
} catch (error) {
  console.error(chalk.red(`\n✖ ${error instanceof Error ? error.message : String(error)}`));
  process.exitCode = 1;
}
