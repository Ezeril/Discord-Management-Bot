const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'purge',
  aliases: ['clear'],
  description: 'Supprime un nombre de messages (1 à 100, moins de 14 jours).',
  usage: 'purge <nombre>',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ManageMessages],
  botPerms: [PermissionFlagsBits.ManageMessages],

  async execute(message, args) {
    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez saisir un nombre entre 1 et 100.')] });
    }

    await message.delete().catch(() => {});
    const deleted = await message.channel.bulkDelete(amount, true);

    const confirm = await message.channel.send({
      embeds: [embed.success('Nettoyage', `**${deleted.size}** message(s) supprimé(s).`)],
    });
    setTimeout(() => confirm.delete().catch(() => {}), config.moderation.purgeConfirmDeleteSeconds * 1000);
  },
};
