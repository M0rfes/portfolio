export const TAG_RING_RADIUS = 160;
export const TAG_SPHERE_RADIUS = 150;
export const TAG_PULL_STRENGTH = 0.05;

export type Point2 = { x: number; y: number };
export type Point3 = { x: number; y: number; z: number };

export function hashTag(tag: string): number {
  let hash = 2166136261;
  for (let i = 0; i < tag.length; i += 1) {
    hash ^= tag.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function tagHome2d(tag: string, radius = TAG_RING_RADIUS): Point2 {
  const angle = (hashTag(normalizeTag(tag)) / 0x1_0000_0000) * Math.PI * 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

export function tagHome3d(tag: string, radius = TAG_SPHERE_RADIUS): Point3 {
  const key = normalizeTag(tag);
  const theta = (hashTag(key) / 0x1_0000_0000) * Math.PI * 2;
  const phi = Math.acos(2 * (hashTag(`${key}\0z`) / 0x1_0000_0000) - 1);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.sin(phi) * Math.sin(theta),
    z: radius * Math.cos(phi),
  };
}

export function nodeTagTarget(
  tags: string[] | undefined,
  dim: 2,
): Point2 | null;
export function nodeTagTarget(
  tags: string[] | undefined,
  dim: 3,
): Point3 | null;
export function nodeTagTarget(
  tags: string[] | undefined,
  dim: 2 | 3,
): Point2 | Point3 | null {
  const unique = uniqueTags(tags);
  if (!unique.length) return null;
  if (dim === 2) {
    const homes = unique.map((tag) => tagHome2d(tag));
    return {
      x: homes.reduce((sum, home) => sum + home.x, 0) / homes.length,
      y: homes.reduce((sum, home) => sum + home.y, 0) / homes.length,
    };
  }
  const homes = unique.map((tag) => tagHome3d(tag));
  return {
    x: homes.reduce((sum, home) => sum + home.x, 0) / homes.length,
    y: homes.reduce((sum, home) => sum + home.y, 0) / homes.length,
    z: homes.reduce((sum, home) => sum + home.z, 0) / homes.length,
  };
}

export function tagPullStrength(tags: string[] | undefined) {
  return uniqueTags(tags).length ? TAG_PULL_STRENGTH : 0;
}

function uniqueTags(tags: string[] | undefined) {
  return [
    ...new Set(
      (tags ?? [])
        .map((tag) => normalizeTag(tag))
        .filter((tag) => tag.length > 0),
    ),
  ];
}

function normalizeTag(tag: string) {
  return tag.trim().toLowerCase();
}
