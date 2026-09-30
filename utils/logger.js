const config = require('../config');
const embed  = require('./embed');

async function modLog(guild, client, opts = {}) {
  const channelId = config.channels.modLogs;
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;

  const e = embed.custom(opts.color || config.colors.main, {
    footerText: `${config.embeds.footerText} • Logs`,
  })
    .setTitle(opts.title || 'Action de modération')
    .setDescription(opts.description || '')
    .addFields(opts.fields || []);

  if (opts.thumbnail) e.setThumbnail(opts.thumbnail);

  await channel.send({ embeds: [e] }).catch(() => {});
}

async function raidLog(guild, embeds) {
  const channelId = config.channels.antiRaidLogs;
  if (!channelId) return;
  const channel = guild.channels.cache.get(channelId);
  if (!channel) return;
  await channel.send({ embeds: Array.isArray(embeds) ? embeds : [embeds] }).catch(() => {});
}

module.exports = { modLog, raidLog };
