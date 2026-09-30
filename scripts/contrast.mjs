// Verifica el contraste WCAG 2.1 de los pares de color de src/styles/ritech-theme.css.
// Uso: node scripts/contrast.mjs
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/ritech-theme.css", import.meta.url), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]),
);

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [primer plano, fondo, mínimo]
const text = 4.5;
const ui = 3;
const pairs = [
  ["--v-text", "--v-canvas", text],
  ["--v-text", "--v-paper", text],
  ["--v-text", "--v-beige", text],
  ["--v-text-2", "--v-canvas", text],
  ["--v-text-2", "--v-beige", text],
  ["--v-text-3", "--v-canvas", text],
  ["--v-text-3", "--v-beige", text],
  ["--v-on-ink", "--v-ink", text],
  ["--v-on-accent", "--v-pink", text],
  ["--v-on-accent", "--v-olive", text],
  ["--v-on-accent", "--v-yellow", text],
  ["--v-on-accent", "--v-blue", text],
  ["--v-on-accent", "--v-pink-deep", text],
  ["--rt-cherry", "--v-canvas", text],
  ["--rt-cherry", "--v-paper", text],
  ["--rt-leaf", "--v-canvas", text],
  ["--v-accent-ink", "--v-beige", text],
  ["--v-olive-ink", "--v-canvas", text],
  ["--v-danger-ink", "--v-danger-soft", text],
  ["--v-danger-ink", "--v-canvas", text],
  ["--status-ok-ink", "--status-ok-bg", text],
  ["--status-warn-ink", "--status-warn-bg", text],
  ["--status-danger-ink", "--status-danger-bg", text],
  ["--status-info-ink", "--status-info-bg", text],
  ["--status-pending-ink", "--status-pending-bg", text],
  ["--on-structure", "--v-structure", text],
  ["--structure-text", "--structure-quiet", text],
  ["--muted-foreground-tinted", "--v-pink-soft", text],
  ["--muted-foreground-tinted", "--v-beige-2", text],
  ["--v-brand", "--v-canvas", ui],
  ["--v-brand", "--v-paper", ui],
  ["--v-edge", "--v-canvas", ui],
  ["--v-edge", "--v-beige", ui],
];

let failed = 0;
for (const [fg, bg, min] of pairs) {
  if (!tokens[fg] || !tokens[bg]) {
    console.log(`??   ${fg} / ${bg}: token no encontrado`);
    failed++;
    continue;
  }
  const r = ratio(tokens[fg], tokens[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? "OK  " : "FAIL"} ${r.toFixed(2).padStart(5)}:1 (min ${min}) ${fg} ${tokens[fg]} sobre ${bg} ${tokens[bg]}`);
}
// Blanco sobre el relleno de peligro (botón destructivo)
const white = ratio("#FFFFFF", tokens["--v-danger-fill"]);
console.log(`${white >= text ? "OK  " : "FAIL"} ${white.toFixed(2).padStart(5)}:1 (min 4.5) #FFFFFF sobre --v-danger-fill`);
if (white < text) failed++;

console.log(failed ? `\n${failed} par(es) no cumplen AA` : "\nTodos los pares cumplen WCAG AA");
process.exit(failed ? 1 : 0);
