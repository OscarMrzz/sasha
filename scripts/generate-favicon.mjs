import { writeFileSync } from "node:fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const SOURCE = "public/a-aurora2.png";
const SIZES = [16, 32];

function circleMask(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`
  );
}

async function createRoundIcon(size, outputPath) {
  const innerSize = Math.round(size * 0.9);
  const padding = Math.floor((size - innerSize) / 2);

  const rounded = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: "cover", position: "centre" })
    .extend({
      top: padding,
      bottom: size - innerSize - padding,
      left: padding,
      right: size - innerSize - padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .composite([{ input: circleMask(size), blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp(rounded).toFile(outputPath);
}

for (const size of SIZES) {
  const filename = `public/favicon-${size}.png`;
  await createRoundIcon(size, filename);
  console.log(`Generado: ${filename}`);
}

const ico = await pngToIco(["public/favicon-16.png", "public/favicon-32.png"]);
writeFileSync("public/favicon.ico", ico);
console.log("Generado: public/favicon.ico");
