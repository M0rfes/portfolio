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
      (): number;
      (value: number): Force<Node>;
    };
    y: {
      (): number;
      (value: number): Force<Node>;
    };
    z: {
      (): number;
      (value: number): Force<Node>;
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
  export function forceX<Node = unknown>(x?: number): Force<Node>;
  export function forceY<Node = unknown>(y?: number): Force<Node>;
  export function forceZ<Node = unknown>(z?: number): Force<Node>;
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
