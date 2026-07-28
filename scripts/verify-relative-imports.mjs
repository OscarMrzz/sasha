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

const re = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
const broken = [];

for (const file of walk("src")) {
  const t = fs.readFileSync(file, "utf8");
  let m;
  while ((m = re.exec(t))) {
    const spec = m[1];
    const resolved = path.resolve(path.dirname(file), spec);
    const candidates = [
      resolved,
      resolved + ".ts",
      resolved + ".tsx",
      resolved + ".js",
      resolved + ".jsx",
      resolved + ".json",
      path.join(resolved, "index.ts"),
      path.join(resolved, "index.tsx"),
    ];
    if (!candidates.some((c) => fs.existsSync(c))) {
      broken.push({ file, spec, resolved });
    }
  }
}

console.log("broken relative imports:", broken.length);
broken.forEach((b) => console.log(b.spec, "<-", b.file));
