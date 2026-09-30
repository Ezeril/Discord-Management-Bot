const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

let errors = 0;
const fail = msg => { console.error(`❌ ${msg}`); errors++; };
const ok   = msg => console.log(`✅ ${msg}`);
const hex  = /^#[0-9a-fA-F]{6}$/;

require('dotenv').config({ path: path.join(root, '.env') });
if (!process.env.TOKEN || process.env.TOKEN === 'colle_ton_token_ici') fail('TOKEN manquant dans .env');
else ok('TOKEN présent');

const config = require('../config');
for (const [name, value] of Object.entries(config.colors)) {
  if (!hex.test(value)) fail(`Couleur invalide colors.${name} : "${value}" (attendu #RRGGBB)`);
}
if (!config.prefix) fail('prefix vide');
if (!['kick', 'ban'].includes(config.antiRaid.newAccountAction)) fail('antiRaid.newAccountAction doit être "kick" ou "ban"');
if (config.tickets.requireApproval && !config.tickets.requestChannelId) {
  console.warn('⚠️  tickets.requireApproval est activé mais tickets.requestChannelId est vide.');
}
ok('config.js chargé');

const names = new Set();
for (const folder of fs.readdirSync(path.join(root, 'commands'))) {
  for (const file of fs.readdirSync(path.join(root, 'commands', folder)).filter(f => f.endsWith('.js'))) {
    try {
      const cmd = require(path.join(root, 'commands', folder, file));
      if (!cmd.name || typeof cmd.execute !== 'function') fail(`${folder}/${file} : name/execute manquant`);
      for (const n of [cmd.name, ...(cmd.aliases || [])]) {
        if (names.has(n)) fail(`Doublon de commande/alias : ${n}`);
        names.add(n);
      }
    } catch (e) { fail(`${folder}/${file} : ${e.message}`); }
  }
}
ok(`${names.size} noms de commandes/alias uniques`);

for (const file of fs.readdirSync(path.join(root, 'events')).filter(f => f.endsWith('.js'))) {
  try { require(path.join(root, 'events', file)); } catch (e) { fail(`events/${file} : ${e.message}`); }
}
ok('événements chargés');

const integrity = require('../utils/credits').check();
if (integrity.length) integrity.forEach(p => fail(`Intégrité des crédits : ${p}`));
else ok('intégrité des crédits');

console.log(errors ? `\n${errors} problème(s) détecté(s).` : '\nTout est OK 🎉');
process.exit(errors ? 1 : 0);
