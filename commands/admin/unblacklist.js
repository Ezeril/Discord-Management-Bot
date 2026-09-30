const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { resolveUser } = require('../../utils/permissions');
const { removeBlacklist, isBlacklisted } = require('../../utils/db');

module.exports = {
  name: 'unblacklist',
  aliases: ['unbl'],
  description: 'Retire un membre de la blacklist du bot.',
  usage: 'unblacklist <@membre>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    const target = await resolveUser(message, args);

    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    if (!isBlacklisted(message.guild.id, target.id)) {
      return message.reply({ embeds: [embed.warning('Attention', 'Ce membre n\'est pas sur la blacklist.')] });
    }

    removeBlacklist(message.guild.id, target.id);
    message.reply({ embeds: [embed.success('Succès', `**${target.tag}** a été retiré de la blacklist.`)] });
  },
};