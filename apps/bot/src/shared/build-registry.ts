/** Construit une `Map<name, item>` depuis un tableau, en throwant si deux items partagent la même clé `name`. */
export function buildRegistry<T>(items: Array<T>, getNames: (item: T) => string | Array<string>): Map<string, T> {
  const registry = new Map<string, T>();

  for (const item of items) {
    const names = getNames(item);

    for (const name of Array.isArray(names) ? names : [names]) {
      if (registry.has(name)) {
        throw new Error(`Doublon dans le registre: "${name}"`);
      }

      registry.set(name, item);
    }
  }

  return registry;
}
