import fs from "fs";
import path from "path";

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(e.name)) walk(f, acc);
    } else if (/\.(ts|tsx)$/.test(e.name)) acc.push(f);
  }
  return acc;
}

const importRe = /from\s+['"](@\/[^'"]+)['"]/g;
const missing = [];
const oldPaths = [];
const files = walk("src");

for (const file of files) {
  const t = fs.readFileSync(file, "utf8");
  if (
    t.includes("@/interfaces") ||
    t.includes("@/component/") ||
    t.includes("@/feacture/") ||
    t.includes("@/Store/") ||
    t.includes("@/lib/services/") ||
    t.includes("@/lib/actions/") ||
    t.includes("@/lib/fechas/") ||
    t.includes("@/lib/navegacion/") ||
    t.includes("@/lib/atajos/")
  ) {
    oldPaths.push(file);
  }

  let m;
  while ((m = importRe.exec(t))) {
    const spec = m[1];
    const rel = spec.slice(2);
    const base = path.join("src", rel);
    const candidates = [
      base,
      base + ".ts",
      base + ".tsx",
      base + ".js",
      base + ".jsx",
      base + ".json",
      path.join(base, "index.ts"),
      path.join(base, "index.tsx"),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      missing.push({ file, spec });
    }
  }
}

console.log("files scanned", files.length);
console.log("files with old import prefixes", oldPaths.length);
oldPaths.slice(0, 20).forEach((f) => console.log("OLD", f));
console.log("missing modules", missing.length);
missing.slice(0, 60).forEach((x) => console.log(x.spec, "<-", x.file));
