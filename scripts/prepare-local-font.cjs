// The upstream generator fetches Google Fonts during compilation. Use the same
// Roboto family locally so a remote font response cannot break content deploys.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules', 'aoe_technology_radar');
const cached = path.join(root, '.techradar');
const oldImport = 'import { Roboto } from "next/font/google";';
const newImport = 'import localFont from "next/font/local";';
const oldDeclaration = 'const font = Roboto({ weight: ["400", "700"], subsets: ["latin"] });';
const newDeclaration = 'const font = localFont({ src: "../../fonts/roboto-latin.woff2", weight: "100 900", style: "normal", display: "swap" });';

if (!fs.existsSync(source)) throw new Error('Run npm install before preparing the radar font.');
for (const target of [source, cached].filter(fs.existsSync)) {
  const layout = path.join(target, 'src', 'components', 'Layout', 'Layout.tsx');
  let text = fs.readFileSync(layout, 'utf8');
  if (text.includes(oldImport) && text.includes(oldDeclaration)) {
    text = text.replace(oldImport, newImport).replace(oldDeclaration, newDeclaration);
  } else if (!text.includes(newImport) || !text.includes(newDeclaration)) {
    throw new Error(`Unexpected generator font setup in ${layout}; review the local-font adapter.`);
  }
  const fonts = path.join(target, 'src', 'fonts');
  fs.mkdirSync(fonts, { recursive: true });
  for (const file of ['roboto-latin.woff2', 'OFL.txt']) {
    fs.copyFileSync(path.join(root, 'assets', 'fonts', file), path.join(fonts, file));
  }
  fs.writeFileSync(layout, text);
}
console.log('Radar generator prepared with bundled Roboto.');
