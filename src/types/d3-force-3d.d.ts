declare module "d3-force-3d" {
  type StrengthFn<Node> = (node: Node, index: number, nodes: Node[]) => number;
  type Strength<Node = unknown> = number | StrengthFn<Node>;

  interface Force<Node = unknown> {
    (alpha: number): void;
    initialize?: (nodes: Node[]) => void;
    strength: {
      (): Strength<Node>;
      (value: Strength<Node>): Force<Node>;
    };
    x: {
      (): Strength<Node>;
      (value: Strength<Node>): Force<Node>;
    };
    y: {
      (): Strength<Node>;
      (value: Strength<Node>): Force<Node>;
    };
    z: {
      (): Strength<Node>;
      (value: Strength<Node>): Force<Node>;
    };
    radius: {
      (): Strength<Node>;
      (value: Strength<Node>): Force<Node>;
    };
    [key: string]: unknown;
  }

  export function forceCenter<Node = unknown>(
    x?: number,
    y?: number,
    z?: number,
  ): Force<Node>;
  export function forceX<Node = unknown>(x?: Strength<Node>): Force<Node>;
  export function forceY<Node = unknown>(y?: Strength<Node>): Force<Node>;
  export function forceZ<Node = unknown>(z?: Strength<Node>): Force<Node>;
  export function forceRadial<Node = unknown>(
    radius: Strength<Node>,
    x?: number,
    y?: number,
    z?: number,
  ): Force<Node>;
  export function forceCollide<Node = unknown>(
    radius?: Strength<Node>,
  ): Force<Node>;
}
