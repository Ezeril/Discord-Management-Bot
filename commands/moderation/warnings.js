const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { getWarns } = require('../../utils/db');
const { resolveUser } = require('../../utils/permissions');

module.exports = {
  name: 'warnings',
  aliases: ['warns'],
  description: 'Affiche les avertissements d\'un membre.',
  usage: 'warnings <@membre|ID>',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args) {
    const target = await resolveUser(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    const userWarns = getWarns()[message.guild.id]?.[target.id] || [];
    if (!userWarns.length) {
      return message.reply({ embeds: [embed.info('Avertissements', `**${target.tag}** n'a aucun avertissement.`)] });
    }

    const lines = userWarns.map((w, i) =>
      `**${i + 1}.** Par <@${w.moderator}> le <t:${Math.floor(w.date / 1000)}:d>\n↳ *${w.reason}*`
    );
    let description = '';
    let shown = 0;
    for (const line of lines.reverse()) {
      if ((description + line).length > 3800) break;
      description = `${line}\n\n${description}`;
      shown++;
    }
    if (shown < userWarns.length) description = `*(${userWarns.length - shown} avertissement(s) plus ancien(s) non affiché(s))*\n\n${description}`;

    message.reply({ embeds: [embed.mod(`Avertissements de ${target.tag} (${userWarns.length})`, description.trim())] });
  },
};
