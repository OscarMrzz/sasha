import fs from "fs";
import path from "path";

const servicesDir = path.join("src", "services");

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f, acc);
    else if (/\.(ts|tsx)$/.test(e.name)) acc.push(f);
  }
  return acc;
}

let changed = 0;
for (const file of walk(servicesDir)) {
  let t = fs.readFileSync(file, "utf8");
  const next = t
    .replaceAll('from "../supabase"', 'from "@/lib/supabase"')
    .replaceAll("from '../supabase'", "from '@/lib/supabase'")
    .replaceAll('from "../../lib/supabase"', 'from "@/lib/supabase"')
    .replaceAll('from "../supabaseStorageImage"', 'from "@/lib/supabaseStorageImage"')
    .replaceAll('from "../utils"', 'from "@/lib/utils"');
  if (next !== t) {
    fs.writeFileSync(file, next);
    changed++;
    console.log("fixed", file);
  }
}
console.log("changed", changed);
