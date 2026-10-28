import { type Shape, area, group } from './shapes';

type Listener<T> = (value: T, previous: T) => void;

export class Store<T extends object> {
  #value: T;
  #listeners = new Set<Listener<T>>();

  constructor(initial: T) {
    this.#value = initial;
  }

  get value(): Readonly<T> {
    return this.#value;
  }

  update<K extends keyof T>(key: K, next: T[K]): void {
    const previous = this.#value;
    this.#value = { ...previous, [key]: next };
    for (const listener of this.#listeners) listener(this.#value, previous);
  }

  subscribe(listener: Listener<T>): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}

export const shapes = new Store({ items: [] as Shape[], total: 0 });

shapes.subscribe(({ items }) => {
  const grouped = group(items);
  const total = items.reduce((sum, s) => sum + area(s), 0);
  if (grouped.circle.length + grouped.rect.length + grouped.triangle.length !== items.length || total < 0) {
    throw new Error('inconsistent store');
  }
});
