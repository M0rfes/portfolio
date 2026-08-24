const DARK_INK = "#0a0a0a";
const LIGHT_INK = "#f5f5f5";
const LIGHT_BACKGROUND_LUMINANCE = 0.179;

type Rgb = { r: number; g: number; b: number };

export function contrastAgainst(background: string): string {
  const rgb = parseCssColor(background);
  if (!rgb) return LIGHT_INK;
  return relativeLuminance(rgb) > LIGHT_BACKGROUND_LUMINANCE
    ? DARK_INK
    : LIGHT_INK;
}

export function lighten(color: string, amount = 0.28): string {
  const rgb = parseCssColor(color);
  if (!rgb) return color;
  const t = Math.min(1, Math.max(0, amount));
  const mix = (channel: number) => Math.round(channel + (255 - channel) * t);
  return `#${toHex(mix(rgb.r))}${toHex(mix(rgb.g))}${toHex(mix(rgb.b))}`;
}

function toHex(value: number) {
  return value.toString(16).padStart(2, "0");
}

function parseCssColor(value: string): Rgb | null {
  const hex = value.trim();
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(hex);
  if (short) {
    return {
      r: Number.parseInt(short[1] + short[1], 16),
      g: Number.parseInt(short[2] + short[2], 16),
      b: Number.parseInt(short[3] + short[3], 16),
    };
  }
  const full = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (full) {
    return {
      r: Number.parseInt(full[1], 16),
      g: Number.parseInt(full[2], 16),
      b: Number.parseInt(full[3], 16),
    };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(hex);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }
  return null;
}

function relativeLuminance({ r, g, b }: Rgb) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function channel(value: number) {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}
