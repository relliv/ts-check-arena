// A small, dependency-free project for smoke runs: enough generics, unions and
// mapped types that every checker does real work, quick enough for CI.
export type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

export function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}

export type ByKind = { [K in Shape['kind']]: Extract<Shape, { kind: K }> };

export function group(shapes: readonly Shape[]): { [K in keyof ByKind]: ByKind[K][] } {
  const out = { circle: [], rect: [], triangle: [] } as { [K in keyof ByKind]: ByKind[K][] };
  for (const s of shapes) (out[s.kind] as Shape[]).push(s);
  return out;
}
