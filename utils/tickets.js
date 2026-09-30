const {
  ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const config = require('../config');
const embed  = require('./embed');
const { getTicketMsg, getTicketCategory } = require('./db');

function findUserTicket(guild, userId) {
  return guild.channels.cache.find(c =>
    c.type === ChannelType.GuildText &&
    c.topic === userId &&
    c.name.startsWith(config.tickets.channelPrefix)
  ) || null;
}

function isTicketChannel(channel) {
  return channel?.type === ChannelType.GuildText && channel.name.startsWith(config.tickets.channelPrefix);
}

function ticketButtons(claimed = false) {
  const row = new ActionRowBuilder();
  if (!claimed) {
    row.addComponents(new ButtonBuilder().setCustomId('claim_ticket').setLabel('Prendre en charge').setEmoji('👋').setStyle(ButtonStyle.Success));
  }
  row.addComponents(
    new ButtonBuilder().setCustomId('notify_user').setLabel('Rappeler le membre').setEmoji('🔔').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('close_ticket').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger),
  );
  return row;
}

async function openTicket(guild, user, client, reason = null) {
  const view = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory];

  const permissionOverwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id,        allow: view },
    { id: client.user.id, allow: [...view, PermissionFlagsBits.ManageChannels] },
  ];
  for (const roleId of config.tickets.staffRoleIds) {
    if (guild.roles.cache.has(roleId)) permissionOverwrites.push({ id: roleId, allow: view });
  }

  const options = {
    name: `${config.tickets.channelPrefix}${user.username}`,
    type: ChannelType.GuildText,
    topic: user.id,
    permissionOverwrites,
  };

  const categoryId = getTicketCategory(guild.id) || config.tickets.categoryId;
  if (categoryId && guild.channels.cache.get(categoryId)?.type === ChannelType.GuildCategory) {
    options.parent = categoryId;
  }

  const channel = await guild.channels.create(options);

  const template = getTicketMsg(guild.id) || config.tickets.welcomeMessage;
  const welcome = embed.info('Ticket Ouvert', embed.format(template, { user: `${user}` }));
  if (reason) welcome.addFields({ name: 'Raison', value: reason.slice(0, 1024) });

  await channel.send({ content: `${user}`, embeds: [welcome], components: [ticketButtons()] });
  return channel;
}

module.exports = { findUserTicket, isTicketChannel, ticketButtons, openTicket };
