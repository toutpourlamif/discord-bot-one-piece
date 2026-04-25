/** Construit une `Map<name, item>` depuis un tableau, en throwant si deux items partagent la même clé `name`. */
export function buildRegistryWithUniqueNames<T>(items: Array<T>, getName: (item: T) => string): Map<string, T> {
  const registry = new Map<string, T>();
  for (const item of items) {
    const name = getName(item);
    if (registry.has(name)) {
      throw new Error(`Doublon dans le registre: "${name}"`);
    }
    registry.set(name, item);
  }
  return registry;
}
