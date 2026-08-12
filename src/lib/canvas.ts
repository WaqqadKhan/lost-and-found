/**
 * Canvas theme helpers — site-wide background color / gradient with contrast-safe surfaces.
 */

export type CanvasMode = "solid" | "gradient";

export type CanvasSettings = {
  canvasMode: CanvasMode;
  canvasColor1: string;
  canvasColor2: string;
  canvasColor3: string | null;
  gradientAngle: number;
};

export const DEFAULT_CANVAS: CanvasSettings = {
  canvasMode: "solid",
  canvasColor1: "#F4F1E8",
  canvasColor2: "#E4EDE4",
  canvasColor3: "#E8F0F4",
  gradientAngle: 145,
};

export function normalizeHex(input: string, fallback = "#F4F1E8"): string {
  const raw = String(input || "").trim();
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) return withHash.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(withHash)) {
    const a = withHash[1];
    const b = withHash[2];
    const c = withHash[3];
    return `#${a}${a}${b}${b}${c}${c}`.toUpperCase();
  }
  return fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = normalizeHex(hex);
  const m = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i.exec(h);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/** Relative luminance 0–1 (sRGB). */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.9;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function averageCanvasLuminance(settings: CanvasSettings): number {
  const colors =
    settings.canvasMode === "gradient"
      ? [settings.canvasColor1, settings.canvasColor2, settings.canvasColor3].filter(Boolean) as string[]
      : [settings.canvasColor1];
  if (!colors.length) return 0.9;
  return colors.reduce((sum, c) => sum + relativeLuminance(c), 0) / colors.length;
}

/** True when canvas is dark enough that light “paper” surfaces are needed for contrast. */
export function isDarkCanvas(settings: CanvasSettings): boolean {
  return averageCanvasLuminance(settings) < 0.45;
}

export function buildCanvasBackground(settings: CanvasSettings): string {
  const c1 = normalizeHex(settings.canvasColor1, DEFAULT_CANVAS.canvasColor1);
  const c2 = normalizeHex(settings.canvasColor2, DEFAULT_CANVAS.canvasColor2);
  const c3 = settings.canvasColor3
    ? normalizeHex(settings.canvasColor3, DEFAULT_CANVAS.canvasColor3!)
    : null;
  const angle = Number.isFinite(settings.gradientAngle) ? settings.gradientAngle : 145;

  if (settings.canvasMode === "gradient") {
    if (c3) return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
  }
  return c1;
}

/**
 * Contrast-safe CSS variables. Uses a “paper on canvas” strategy:
 * colorful page background + opaque readable cards/nav regardless of canvas brightness.
 */
export function buildCanvasCssVars(settings: CanvasSettings): Record<string, string> {
  const dark = isDarkCanvas(settings);
  const bg = buildCanvasBackground(settings);

  if (dark) {
    return {
      "--page-canvas": bg,
      "--background": "transparent",
      "--foreground": "oklch(0.98 0.01 90)",
      "--card": "oklch(0.99 0.005 90)",
      "--card-foreground": "oklch(0.22 0.02 155)",
      "--popover": "oklch(0.99 0.005 90)",
      "--popover-foreground": "oklch(0.22 0.02 155)",
      "--muted": "oklch(0.94 0.015 90)",
      "--muted-foreground": "oklch(0.42 0.02 155)",
      "--secondary": "oklch(0.94 0.02 90)",
      "--secondary-foreground": "oklch(0.28 0.04 155)",
      "--accent": "oklch(0.93 0.03 155)",
      "--accent-foreground": "oklch(0.28 0.08 155)",
      "--border": "oklch(0.88 0.02 90)",
      "--input": "oklch(0.9 0.015 90)",
      "--navbar-bg": "oklch(0.99 0.005 90 / 0.92)",
      "--footer-bg": "oklch(0.99 0.005 90 / 0.85)",
      "--surface-readable": "oklch(0.99 0.005 90)",
      color: "oklch(0.98 0.01 90)",
    };
  }

  return {
    "--page-canvas": bg,
    "--background": "transparent",
    "--foreground": "oklch(0.22 0.02 155)",
    "--card": "oklch(0.995 0.005 90)",
    "--card-foreground": "oklch(0.22 0.02 155)",
    "--popover": "oklch(0.995 0.005 90)",
    "--popover-foreground": "oklch(0.22 0.02 155)",
    "--muted": "oklch(0.955 0.012 90)",
    "--muted-foreground": "oklch(0.45 0.02 155)",
    "--secondary": "oklch(0.95 0.02 90)",
    "--secondary-foreground": "oklch(0.32 0.04 155)",
    "--accent": "oklch(0.94 0.03 155)",
    "--accent-foreground": "oklch(0.32 0.08 155)",
    "--border": "oklch(0.88 0.02 90)",
    "--input": "oklch(0.9 0.015 90)",
    "--navbar-bg": "oklch(0.995 0.005 90 / 0.92)",
    "--footer-bg": "oklch(0.995 0.005 90 / 0.7)",
    "--surface-readable": "oklch(0.995 0.005 90)",
    color: "oklch(0.22 0.02 155)",
  };
}
