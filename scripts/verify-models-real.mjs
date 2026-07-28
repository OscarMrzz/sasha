import fs from "fs";
import path from "path";

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (f.endsWith(".ts")) acc.push(f);
  }
  return acc;
}

const files = walk("src/models");
let bad = 0;
let empty = 0;
for (const f of files) {
  const rel = f.replace(/\\/g, "/");
  const t = fs.readFileSync(f, "utf8");
  if (rel === "src/models/index.ts") {
    if (t.includes("allInterfaces")) {
      console.log("index still refs allInterfaces");
      bad++;
    }
    continue;
  }
  if (rel.endsWith("/index.ts")) {
    console.log("domain index still exists", rel);
    bad++;
  }
  if (t.includes("allInterfaces")) {
    console.log("allInterfaces ref", rel);
    bad++;
  }
  if (t.trim().length < 20) {
    console.log("empty/tiny", rel, t.length);
    empty++;
  }
  if (!/export\s+(interface|type)\s+\w+/.test(t)) {
    console.log("no real export", rel);
    bad++;
  }
}

console.log("model files", files.length);
console.log("bad", bad, "empty", empty);
console.log("allInterfaces exists", fs.existsSync("src/models/allInterfaces.ts"));

// verify @/models and @/models/auditoria imports in src
function walkSrc(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(e.name)) walkSrc(f, acc);
    } else if (/\.(ts|tsx)$/.test(e.name)) acc.push(f);
  }
  return acc;
}

const audImports = [];
for (const f of walkSrc("src")) {
  const t = fs.readFileSync(f, "utf8");
  if (t.includes('from "@/models/auditoria"') || t.includes("from '@/models/auditoria'")) {
    audImports.push(f);
  }
}
console.log("@/models/auditoria imports", audImports.length);
audImports.slice(0, 10).forEach((f) => console.log(" ", f));
