const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { clearWarns } = require('../../utils/db');
const { resolveUser } = require('../../utils/permissions');

module.exports = {
  name: 'clearwarns',
  description: 'Efface tous les avertissements d\'un membre.',
  usage: 'clearwarns <@membre|ID>',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args) {
    const target = await resolveUser(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    clearWarns(message.guild.id, target.id);
    message.reply({ embeds: [embed.success('Succès', `Tous les avertissements de **${target.tag}** ont été effacés.`)] });
  },
};
