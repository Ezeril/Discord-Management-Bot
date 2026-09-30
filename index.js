require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs     = require('fs');
const path   = require('path');
const config = require('./config');
const credits = require('./utils/credits');

if (!process.env.TOKEN) {
  console.error('[ERREUR] Aucun TOKEN trouvé. Copie .env.example en .env puis renseigne ton token.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.commands  = new Collection();
client.cooldowns = new Collection();

client.joinTracker    = new Map();
client.lockedDown     = new Map();
client.lockdownTimers = new Map();

const commandsPath = path.join(__dirname, 'commands');
let loaded = 0;

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    let command;
    try {
      command = require(path.join(folderPath, file));
    } catch (err) {
      console.error(`[COMMANDE] Impossible de charger ${folder}/${file} :`, err.message);
      continue;
    }

    if (!command.name || typeof command.execute !== 'function') {
      console.warn(`[COMMANDE] ${folder}/${file} ignorée (name ou execute manquant).`);
      continue;
    }

    const disabled = !command.protected && (config.disabledCommands.includes(command.name)
      || config.disabledCategories.includes(command.category));
    if (disabled) continue;

    for (const key of [command.name, ...(command.aliases || [])]) {
      if (client.commands.has(key)) console.warn(`[COMMANDE] Doublon de nom/alias "${key}" (${folder}/${file}).`);
      client.commands.set(key, command);
    }
    loaded++;
  }
}
console.log(`[COMMANDES] ${loaded} commande(s) chargée(s).`);

credits.enforce(client);
console.log(`[CRÉDITS] Bot créé par ${credits.CREDITS.name} — ${credits.CREDITS.portfolio}`);

const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  const handler = (...args) => event.execute(...args, client);
  if (event.once) client.once(event.name, handler);
  else client.on(event.name, handler);
}

process.on('unhandledRejection', err => console.error('[UnhandledRejection]', err));
process.on('uncaughtException',  err => console.error('[UncaughtException]', err));

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(`\n[${sig}] Arrêt du bot...`);
    client.destroy();
    process.exit(0);
  });
}

client.login(process.env.TOKEN).catch(err => {
  console.error('[LOGIN ERROR]', err.message);
  process.exit(1);
});
