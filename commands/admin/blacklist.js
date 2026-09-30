const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { resolveUser } = require('../../utils/permissions');
const { addBlacklist, isBlacklisted } = require('../../utils/db');

module.exports = {
  name: 'blacklist',
  aliases: ['bl'],
  description: 'Empêche un membre d\'utiliser les commandes du bot.',
  usage: 'blacklist <@membre>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    const target = await resolveUser(message, args);

    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (target.id === message.author.id) return message.reply({ embeds: [embed.error('Erreur', 'Tu ne peux pas te blacklist toi-même.')] });
    if (target.bot) return message.reply({ embeds: [embed.error('Erreur', 'Inutile de blacklist un bot.')] });

    if (isBlacklisted(message.guild.id, target.id)) {
      return message.reply({ embeds: [embed.warning('Attention', 'Ce membre est déjà sur la blacklist.')] });
    }

    addBlacklist(message.guild.id, target.id);
    message.reply({ embeds: [embed.success('Succès', `**${target.tag}** a été ajouté à la blacklist. Il ne peut plus m'utiliser.`)] });
  },
};