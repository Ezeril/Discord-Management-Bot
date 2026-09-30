const { ChannelType } = require('discord.js');
const { getLockdownState, setLockdownState } = require('./db');

function currentSendState(channel, everyone) {
  const ow = channel.permissionOverwrites.cache.get(everyone.id);
  if (!ow) return null;
  if (ow.allow.has('SendMessages')) return true;
  if (ow.deny.has('SendMessages'))  return false;
  return null;
}

async function startLockdown(guild, client) {
  if (client.lockedDown.get(guild.id)) return;
  client.lockedDown.set(guild.id, true);

  const state = getLockdownState(guild.id) || {};
  const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);

  for (const [, channel] of channels) {
    if (channel.id in state) continue;
    const previous = currentSendState(channel, guild.roles.everyone);
    state[channel.id] = previous;
    if (previous === false) continue;
    await channel.permissionOverwrites
      .edit(guild.roles.everyone, { SendMessages: false }, { reason: '[Anti-Raid] Lockdown' })
      .catch(() => {});
  }
  setLockdownState(guild.id, state);
}

async function endLockdown(guild, client) {
  const state = getLockdownState(guild.id);
  client.lockedDown.set(guild.id, false);

  const timer = client.lockdownTimers?.get(guild.id);
  if (timer) { clearTimeout(timer); client.lockdownTimers.delete(guild.id); }

  if (!state) return 0;

  let restored = 0;
  for (const [channelId, previous] of Object.entries(state)) {
    const channel = guild.channels.cache.get(channelId);
    if (!channel) continue;
    await channel.permissionOverwrites
      .edit(guild.roles.everyone, { SendMessages: previous }, { reason: 'Fin du lockdown' })
      .then(() => restored++)
      .catch(() => {});
  }
  setLockdownState(guild.id, null);
  return restored;
}

module.exports = { startLockdown, endLockdown };
