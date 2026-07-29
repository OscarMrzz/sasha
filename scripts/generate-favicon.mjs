import sharp from "sharp";
import pngToIco from "png-to-ico";
import fs from "fs";

// Usar el logo tal cual: negro sobre transparente. Sin retocar colores.
const src = "public/logo.png";
const master = sharp(src).ensureAlpha();

const png16 = await master.clone().resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const png32 = await master.clone().resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const png48 = await master.clone().resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const png180 = await master.clone().resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const png192 = await master.clone().resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

fs.writeFileSync("public/favicon-32.png", png32);
fs.writeFileSync("public/apple-touch-icon.png", png180);
fs.writeFileSync("public/icon-192.png", png192);

const ico = await pngToIco([png16, png32, png48]);
fs.writeFileSync("public/favicon.ico", ico);

console.log("Favicon regenerado desde logo original (sin cambios de color)");
