/**
 * scripts/validate-json.mjs
 * Valida la estructura de albania.json y kosovo.json antes de hacer push.
 * Ejecución: node scripts/validate-json.mjs
 * npm script: npm run validate:json
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '..', 'src', 'data');

const COUNTRIES = [
  { file: 'albania.json', label: 'Albania', currency: 'ALL' },
  { file: 'kosovo.json',  label: 'Kosovo',  currency: 'EUR' },
];

const REQUIRED_BANK_FIELDS = ['name', 'shortName', 'mortgageRatePct', 'loanRatePct'];

let errors = 0;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

for (const { file, label, currency } of COUNTRIES) {
  console.log(`\n── ${label} (${file}) ─────────────────────────`);

  let data;
  try {
    const raw = await readFile(join(DATA_DIR, file), 'utf-8');
    data = JSON.parse(raw);
    ok('JSON válido (sin errores de sintaxis)');
  } catch (e) {
    fail(`No se pudo leer/parsear: ${e.message}`);
    continue;
  }

  // Campos raíz
  if (!data.code)     fail('Falta campo "code"');
  else ok(`code = "${data.code}"`);

  if (!data.currency?.code) fail('Falta currency.code');
  else ok(`currency = ${data.currency.code}`);

  // Sección salary
  if (!data.salary)           fail('Falta sección "salary"');
  else if (!data.salary.minWage) fail('Falta salary.minWage');
  else ok(`salary.minWage = ${data.salary.minWage} ${currency}`);

  // Sección banks
  if (!Array.isArray(data.banks) || data.banks.length === 0) {
    fail('La sección "banks" está vacía o no existe');
  } else {
    ok(`banks: ${data.banks.length} entradas`);
    data.banks.forEach((bank, i) => {
      for (const field of REQUIRED_BANK_FIELDS) {
        if (bank[field] === undefined || bank[field] === null) {
          fail(`banks[${i}] (${bank.name ?? '?'}) falta campo "${field}"`);
        }
      }
      if (typeof bank.mortgageRatePct === 'number' && bank.mortgageRatePct > 30) {
        fail(`banks[${i}] (${bank.name}) mortgageRatePct=${bank.mortgageRatePct} parece muy alto (¿olvidaste dividir por 100?)`);
      }
      if (typeof bank.loanRatePct === 'number' && bank.loanRatePct > 60) {
        fail(`banks[${i}] (${bank.name}) loanRatePct=${bank.loanRatePct} parece muy alto`);
      }
    });
  }

  // Marcadores de edición
  if (!data['_____EDIT_BANK_RATES_BELOW_____']) {
    fail('Falta marcador "_____EDIT_BANK_RATES_BELOW_____"');
  } else {
    ok('Marcador de edición presente');
  }

  const lastUpdate = data['_____LAST_UPDATE_DATE_____'];
  if (!lastUpdate) {
    fail('Falta "_____LAST_UPDATE_DATE_____"');
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(lastUpdate)) {
    fail(`"_____LAST_UPDATE_DATE_____" debe ser YYYY-MM-DD, encontrado: "${lastUpdate}"`);
  } else {
    ok(`Última actualización: ${lastUpdate}`);
  }

  // _meta
  if (!data._meta?.lastVerified) {
    fail('Falta _meta.lastVerified');
  } else {
    ok(`_meta.lastVerified = ${data._meta.lastVerified}`);
  }
}

console.log('\n' + '─'.repeat(50));
if (errors === 0) {
  console.log('✅ All validations passed\n');
  process.exit(0);
} else {
  console.error(`❌ ${errors} error(s) encontrado(s). Corrige antes de hacer push.\n`);
  process.exit(1);
}
