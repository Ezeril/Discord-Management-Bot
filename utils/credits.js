const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const d = s => Buffer.from(s, 'base64').toString('utf8');

const CREDITS = Object.freeze({
  name:      d('RXplcmls'),
  id:        d('NjM4MDEwMDIzMDg3MTc3NzI5'),
  portfolio: d('aHR0cHM6Ly9lemVyaWwueG8uamU='),
  support:   d('aHR0cHM6Ly9kaXNjb3JkLmdnL3lnOHdrUFlxRXQ='),
});

const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');

const normalize = src => src
  .replace(/\r\n/g, '\n')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1')
  .replace(/\s+/g, ' ')
  .trim();
const EXPECTED_CREDITS = 'e31630578010964a6497292136a04f825e41f50fd7120933cc32139f27571ff0';
const EXPECTED_ABOUT   = 'ec6f70d9b8b091a485b64aa05382107b7a2346a9406776b165ee1126596ee867';

function check(client) {
  const problems = [];

  const canon = [CREDITS.name, CREDITS.id, CREDITS.portfolio, CREDITS.support].join('|');
  if (sha256(canon) !== EXPECTED_CREDITS) problems.push('les crédits du créateur ont été modifiés');

  try {
    const file = path.join(__dirname, '..', 'commands', 'info', 'about.js');
    const source = normalize(fs.readFileSync(file, 'utf8'));
    if (sha256(source) !== EXPECTED_ABOUT) problems.push('commands/info/about.js a été modifié');
  } catch {
    problems.push('commands/info/about.js est introuvable');
  }

  if (client && client.commands && client.commands.get('about')?.protected !== true) {
    problems.push('la commande "about" est absente ou désactivée');
  }

  return problems;
}

function enforce(client) {
  const problems = check(client);
  if (!problems.length) return;

  console.error('\n' + '═'.repeat(70));
  console.error('  ❌  DÉMARRAGE REFUSÉ : intégrité des crédits non respectée');
  for (const p of problems) console.error(`      • ${p}`);
  console.error('');
  console.error('  Ce bot a été créé par Ezeril (Discord : 638010023087177729).');
  console.error('  Portfolio : https://ezeril.xo.je');
  console.error('  Restaure les fichiers d\'origine (commands/info/about.js et utils/credits.js)');
  console.error('  depuis le dépôt officiel pour relancer le bot.');
  console.error('═'.repeat(70) + '\n');
  process.exit(1);
}

function assertIntegrity(client) {
  enforce(client);
}

module.exports = { CREDITS, check, enforce, assertIntegrity };
