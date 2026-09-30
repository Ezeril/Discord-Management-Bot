const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'lock',
  description: 'Verrouille le salon actuel.',
  usage: 'lock',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message) {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    message.reply({ embeds: [embed.warning(`${config.emojis.lock} Salon Verrouillé`, 'Les membres ne peuvent plus envoyer de messages ici.')] });
  },
};
