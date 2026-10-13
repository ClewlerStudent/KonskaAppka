import { readFileSync, writeFileSync } from 'node:fs';
import { buildOpenApi } from '../src/contracts/openapi.js';
import { serviceNames, services } from '../src/contracts/index.js';

// Zapisuje openapi/<serwis>.json z kontraktów; --check tylko porównuje z plikiem.
const check = process.argv.includes('--check');
let stale = 0;

for (const name of serviceNames) {
  const file = new URL(`../openapi/${name}.json`, import.meta.url);
  const next = `${JSON.stringify(buildOpenApi(name, services[name]), null, 2)}\n`;
  if (!check) {
    writeFileSync(file, next);
    console.log(`openapi/${name}.json`);
    continue;
  }
  let current = '';
  try {
    current = readFileSync(file, 'utf8');
  } catch {
    // brak pliku = nieaktualny
  }
  if (current !== next) {
    stale += 1;
    console.error(`openapi/${name}.json jest nieaktualny: uruchom npm run openapi`);
  }
}

if (stale > 0) process.exitCode = 1;
