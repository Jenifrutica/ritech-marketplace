/**
 * Ejecuta los casos automatizados del plan de pruebas sobre el prototipo y escribe
 * `resultados.json` (ID → resultado obtenido / pasa).
 *
 *   node pruebas/ejecutar.mjs
 *
 * No modifica el código de la aplicación: el reducer de DemoStore se exporta solo en
 * el bundle temporal que se genera en pruebas/.build.
 */
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "pruebas", ".build");

await build({
  root,
  configFile: false,
  logLevel: "error",
  resolve: { alias: { "@": path.join(root, "src") } },
  esbuild: { jsx: "automatic" },
  plugins: [
    {
      name: "exponer-reducer",
      transform(code, id) {
        if (id.endsWith("src/store/DemoStore.tsx")) return `${code}\nexport { reducer, initialState };\n`;
      },
    },
  ],
  build: {
    ssr: path.join(root, "pruebas", "casos-prototipo.tsx"),
    outDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "casos.mjs" } },
  },
  ssr: { noExternal: true },
});

globalThis.__IMAGENES__ = readdirSync(path.join(root, "public", "images"));
const { default: resultados } = await import(pathToFileURL(path.join(outDir, "casos.mjs")).href);
rmSync(outDir, { recursive: true, force: true });

/** Comandos del proyecto que también son casos del plan. */
// eslint-disable-next-line no-control-regex -- quita los códigos de color ANSI
const sinColor = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
function comando(id, cmd, resumir) {
  try {
    const out = execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    resultados[id] = resumir(sinColor(out), 0);
  } catch (e) {
    resultados[id] = resumir(sinColor(`${e.stdout ?? ""}${e.stderr ?? ""}`), e.status ?? 1);
  }
}

comando("DP-003", "npm run build 2>&1", (out, code) => {
  const js = out.match(/dist\/assets\/index-[^\s]+\.js\s+([\d.,]+ kB) │ gzip: ([\d.,]+ kB)/);
  const aviso = /larger than 500 kB/.test(out);
  const tiempo = out.match(/built in ([\d.]+ ?m?s)/);
  return {
    obtenido: code === 0 ? `tsc -b sin errores y vite build OK${tiempo ? ` en ${tiempo[1]}` : ""}${js ? `; bundle JS ${js[1]} (${js[2]} gzip)` : ""}${aviso ? "; Vite advierte que el bundle supera 500 kB (sin code-splitting)" : ""}` : `Falla la compilación (código ${code}): ${out.trim().split("\n").slice(-3).join(" ")}`,
    pasa: code === 0,
  };
});

comando("RNF-007", "npm run lint 2>&1", (out, code) => {
  const errores = (out.match(/^\s*[×x!]?\s*src\/\S+:\d+:\d+: error/gm) ?? []).length;
  // Solo el código de la aplicación (src/), no los archivos de este arnés en pruebas/.
  const avisos = out.split("\n").filter((l) => /: warning /.test(l) && l.trimStart().startsWith("src/"));
  const deUi = avisos.filter((l) => l.includes("src/components/ui/") || l.includes("src/lib/cojeev")).length;
  return {
    obtenido: `oxlint terminó con código ${code}: ${errores} errores, ${avisos.length} advertencias (${deUi} en código de la librería src/components/ui y src/lib/cojeev, ${avisos.length - deUi} en código propio)`,
    pasa: code === 0 && errores === 0,
  };
});

comando("RNF-008", "npm run contrast 2>&1", (out, code) => {
  const lineas = out.split("\n").filter((l) => /\d+(\.\d+)?:1/.test(l));
  const fallas = lineas.filter((l) => /FAIL|✗|falla/i.test(l));
  return {
    obtenido: code === 0 ? `${lineas.length} combinaciones verificadas, ${fallas.length} fallan; texto: mínimo ${Math.min(...lineas.filter((l) => l.includes("min 4.5")).map((l) => Number(l.match(/(\d+(?:\.\d+)?):1/)[1]))).toFixed(2)}:1 (exige 4.5:1); bordes/íconos: mínimo ${Math.min(...lineas.filter((l) => l.includes("min 3)")).map((l) => Number(l.match(/(\d+(?:\.\d+)?):1/)[1]))).toFixed(2)}:1 (exige 3:1)` : `El script terminó con código ${code}: ${fallas.slice(0, 3).join(" | ")}`,
    pasa: code === 0 && fallas.length === 0,
  };
});

comando("RNF-009", `grep -rEn "(linear|radial|conic)-gradient\\(" src/ || true`, (out) => {
  const n = out.trim() ? out.trim().split("\n").length : 0;
  return { obtenido: n ? `${n} degradados encontrados: ${out.trim().split("\n").slice(0, 3).join(" | ")}` : "0 coincidencias de linear/radial/conic-gradient en src/", pasa: n === 0 };
});

writeFileSync(path.join(root, "pruebas", "resultados.json"), `${JSON.stringify(resultados, null, 2)}\n`);
const ids = Object.keys(resultados);
const fallan = ids.filter((id) => !resultados[id].pasa);
console.log(`${ids.length} casos ejecutados, ${ids.length - fallan.length} pasan, ${fallan.length} fallan${fallan.length ? `: ${fallan.join(", ")}` : ""}`);
for (const id of ids) console.log(`${resultados[id].pasa ? "SI" : "NO"}  ${id}  ${resultados[id].obtenido}`);
