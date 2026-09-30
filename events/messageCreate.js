const config = require('../config');
const embed  = require('../utils/embed');
const { PermissionFlagsBits } = require('discord.js');
const { isBlacklisted } = require('../utils/db');
const { raidLog } = require('../utils/logger');

const spamMap = new Map();

setInterval(() => {
  const now = Date.now();
  const maxAge = config.antiRaid.spamTimeWindow;
  for (const [key, history] of spamMap) {
    if (!history.length || now - history[history.length - 1].t > maxAge) spamMap.delete(key);
  }
}, 60_000).unref();

const deleteLater = (msg, ms) => setTimeout(() => msg.delete().catch(() => {}), ms);

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    if (config.antiRaid.enabled && !isStaff(message.member)) {
      if (await handleMassMention(message)) return;
      if (await handleAntiSpam(message)) return;
    }

    if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) {
      return message.reply({
        embeds: [embed.info('Salut ! 👋',
          `Mon préfixe est \`${config.prefix}\`\nUtilise \`${config.prefix}help\` pour voir la liste de mes commandes.`)],
      }).catch(() => {});
    }

    if (!message.content.startsWith(config.prefix)) return;

    const args    = message.content.slice(config.prefix.length).trim().split(/\s+/);
    const cmdName = args.shift()?.toLowerCase();
    if (!cmdName) return;

    const command = client.commands.get(cmdName);
    if (!command) return;

    if (isBlacklisted(message.guild.id, message.author.id)) {
      return message.reply({
        embeds: [embed.error('Accès refusé', 'Tu es sur la blacklist. Tu ne peux plus utiliser mes commandes.')],
      }).then(m => deleteLater(m, 5000)).catch(() => {});
    }

    if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Map());
    const now        = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldown   = (command.cooldown ?? 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expiration = timestamps.get(message.author.id) + cooldown;
      if (now < expiration) {
        const remaining = ((expiration - now) / 1000).toFixed(1);
        return message.reply({
          embeds: [embed.warning('Cooldown', `Attends encore **${remaining}s** avant de réutiliser \`${config.prefix}${command.name}\`.`)],
        }).then(m => deleteLater(m, 4000)).catch(() => {});
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldown).unref();

    if (command.userPerms?.length) {
      const missing = command.userPerms.filter(p => !message.member.permissions.has(p));
      if (missing.length) {
        return message.reply({
          embeds: [embed.error('Permission refusée', `Tu as besoin de : ${missing.map(p => `\`${permName(p)}\``).join(', ')}`)],
        });
      }
    }

    if (command.botPerms?.length) {
      const missing = command.botPerms.filter(p => !message.guild.members.me.permissions.has(p));
      if (missing.length) {
        return message.reply({
          embeds: [embed.error('Permission manquante', `Il me manque : ${missing.map(p => `\`${permName(p)}\``).join(', ')}`)],
        });
      }
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[CMD ERROR] ${command.name}:`, err);
      message.reply({
        embeds: [embed.error('Erreur inattendue', 'Une erreur est survenue lors de l\'exécution de la commande.')],
      }).catch(() => {});
    }
  },
};


function permName(bit) {
  return Object.entries(PermissionFlagsBits).find(([, v]) => v === bit)?.[0] ?? String(bit);
}

function isStaff(member) {
  return !!member?.permissions.has(PermissionFlagsBits.ManageMessages)
      || !!member?.permissions.has(PermissionFlagsBits.Administrator);
}

async function handleAntiSpam(message) {
  const { spamThreshold, spamTimeWindow, spamTimeoutMinutes } = config.antiRaid;
  if (!message.content) return false;

  const key = `${message.guild.id}-${message.author.id}`;
  const now = Date.now();
  const history = (spamMap.get(key) || []).filter(h => now - h.t < spamTimeWindow);
  history.push({ content: message.content, t: now });
  spamMap.set(key, history);

  const identical = history.filter(h => h.content === message.content);
  if (identical.length < spamThreshold) return false;

  spamMap.delete(key);

  try {
    const msgs = await message.channel.messages.fetch({ limit: 30 });
    const toDelete = msgs.filter(m =>
      m.author.id === message.author.id &&
      m.content === message.content &&
      now - m.createdTimestamp < spamTimeWindow * 2
    );
    await message.channel.bulkDelete(toDelete, true);
  } catch {}

  await message.member.timeout(spamTimeoutMinutes * 60_000, '[Anti-Spam] Spam de messages détecté').catch(() => {});

  await raidLog(message.guild, embed.warning('🤖 Anti-Spam déclenché',
    `**Membre :** ${message.author} (\`${message.author.id}\`)\n` +
    `**Salon :** ${message.channel}\n` +
    `**Messages identiques :** ${identical.length}\n` +
    `**Sanction :** Timeout ${spamTimeoutMinutes} minute(s)`
  ));
  return true;
}

async function handleMassMention(message) {
  const { massMentionThreshold, massMentionTimeoutMinutes } = config.antiRaid;
  const mentions = message.mentions.users.size + message.mentions.roles.size;
  if (mentions < massMentionThreshold) return false;

  await message.delete().catch(() => {});
  await message.member.timeout(massMentionTimeoutMinutes * 60_000, '[Anti-Raid] Mass mention détectée').catch(() => {});

  await raidLog(message.guild, embed.warning('🔔 Mass Mention détectée',
    `**Membre :** ${message.author} (\`${message.author.id}\`)\n` +
    `**Mentions :** ${mentions}\n` +
    `**Salon :** ${message.channel}\n` +
    `**Sanction :** Timeout ${massMentionTimeoutMinutes} minute(s)`
  ));
  return true;
}
