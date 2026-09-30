const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { removeMute } = require('../../utils/db');
const { modLog } = require('../../utils/logger');
const { resolveMember } = require('../../utils/permissions');

module.exports = {
  name: 'unmute',
  description: 'Rend la parole à un membre.',
  usage: 'unmute <@membre|ID>',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],
  botPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (!target.isCommunicationDisabled()) {
      return message.reply({ embeds: [embed.warning('Information', 'Ce membre n\'est pas muet.')] });
    }

    await target.timeout(null, `[Unmute par ${message.author.tag}]`);
    removeMute(message.guild.id, target.id);

    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** peut de nouveau parler.`)] });

    modLog(message.guild, client, {
      title: '🔊 Membre Unmute',
      color: config.colors.unmute,
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });
  },
};
