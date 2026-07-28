import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p));
    else if (f.endsWith(".ts")) out.push(p);
  }
  return out;
}

const files = walk("src/services");
const re = /\.(eq|neq|gt|gte|lt|lte|in|order|select|or)\(\s*[`'"]([^`'"]*)[`'"]/g;
for (const f of files) {
  const txt = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(txt))) {
    const arg = m[2];
    if (/[a-z][A-Z]/.test(arg)) {
      console.log(`${f}: ${m[0].slice(0, 100)}`);
    }
  }
}
