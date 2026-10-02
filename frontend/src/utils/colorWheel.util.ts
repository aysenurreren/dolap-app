export function hueToPosition(
  hue: number,
  saturation: number,
  maxRadius: number
): { x: number; y: number } {
  const angleInDegrees = hue - 90;
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  const radius = (saturation / 100) * maxRadius;

  const x = Math.cos(angleInRadians) * radius;
  const y = Math.sin(angleInRadians) * radius;

  return { x, y };
}