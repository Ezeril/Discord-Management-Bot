const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const giveaways = require('../../utils/giveaways');

module.exports = {
  name: 'gstart',
  aliases: ['giveawaystart'],
  description: 'Lance un giveaway dans le salon actuel.',
  usage: 'gstart <durée> <nombre de gagnants> <lot>',
  category: 'Giveaway',
  userPerms: [PermissionFlagsBits.ManageMessages],
  botPerms: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.ReadMessageHistory,
  ],

  async execute(message, args) {
    try {
      const duration = giveaways.parseDuration(args[0]);

      if (!duration) {
        throw new Error(
          'Durée invalide : utilise s, m, h ou d, entre 10 secondes et 30 jours.\n' +
          'Exemple : gstart 1h 1 Nitro Discord'
        );
      }

      if (!/^[1-9]\d*$/.test(args[1] || '')) {
        throw new Error('Indique un nombre entier de gagnants entre 1 et 20.');
      }

      const winnerCount = Number(args[1]);

      if (winnerCount > 20) {
        throw new Error('Tu peux choisir entre 1 et 20 gagnants.');
      }

      const prize = args.slice(2).join(' ').trim();

      if (!prize || prize.length > 500) {
        throw new Error('Indique un lot contenant entre 1 et 500 caractères.');
      }

      const giveawayMessage = await giveaways.create(
        message,
        duration,
        winnerCount,
        prize
      );

      return message.reply({
        embeds: [
          embed.success(
            'Giveaway créé',
            `Le concours a été lancé : ${giveawayMessage.url}\n` +
            `ID : \`${giveawayMessage.id}\``
          ),
        ],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error('[GIVEAWAY START]', error);

      return message.reply({
        embeds: [embed.error('Erreur', error.message)],
        allowedMentions: { parse: [] },
      });
    }
  },
};
