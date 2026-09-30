const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { endLockdown } = require('../../utils/lockdown');

module.exports = {
  name: 'unlock',
  description: 'Déverrouille le salon actuel, ou lève le lockdown anti-raid avec `unlock all`.',
  usage: 'unlock [all]',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message, args, client) {
    if (args[0]?.toLowerCase() === 'all') {
      const restored = await endLockdown(message.guild, client);
      return message.reply({
        embeds: [embed.success(`${config.emojis.unlock} Lockdown levé`, `**${restored}** salon(s) restauré(s) dans leur état d'origine.`)],
      });
    }

    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
    message.reply({ embeds: [embed.success(`${config.emojis.unlock} Salon Déverrouillé`, 'Les membres peuvent de nouveau envoyer des messages ici.')] });
  },
};
