interface HSL {
  h: number;
  s: number;
  l: number;
}

export function hexToHSL(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function getColorHarmonyScore(hex1: string, hex2: string): number {
  const hsl1 = hexToHSL(hex1);
  const hsl2 = hexToHSL(hex2);

  if (hsl1.s < 15 || hsl2.s < 15) {
    return 0.85;
  }

  let hueDiff = Math.abs(hsl1.h - hsl2.h);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;

  if (hueDiff <= 20) return 1.0;
  if (hueDiff >= 150 && hueDiff <= 180) return 0.9;
  if (hueDiff >= 60 && hueDiff <= 90) return 0.75;
  return 0.4;
}