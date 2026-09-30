const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'couple',
  aliases: ['love', 'amour'],
  description: 'Calcule le pourcentage d\'amour entre deux membres !',
  usage: 'couple <@membre1> [@membre2]',
  category: 'Fun',

  async execute(message) {
    const mentioned = [...message.mentions.users.values()];
    if (!mentioned.length) {
      return message.reply({ embeds: [embed.error('Erreur', 'Tu dois mentionner au moins un membre !')] });
    }

    const [user1, user2] = mentioned.length >= 2 ? mentioned : [message.author, mentioned[0]];
    if (user1.id === user2.id) {
      return message.reply({ embeds: [embed.error('Erreur', 'Il faut deux personnes différentes !')] });
    }

    const loveScore = Math.floor(Math.random() * 101);
    const filled = Math.round(loveScore / 10);
    const bar = '🟥'.repeat(filled) + '⬛'.repeat(10 - filled);

    let comment;
    if (loveScore < 20)       comment = '💔 Aïe... Il vaut mieux rester amis !';
    else if (loveScore < 50)  comment = '❤️‍🩹 C\'est pas gagné, mais l\'espoir fait vivre.';
    else if (loveScore < 80)  comment = '💕 Il y a un bon feeling par ici !';
    else if (loveScore < 100) comment = '💞 Vous êtes faits l\'un pour l\'autre !';
    else                      comment = '💍 C\'est le grand amour parfait ! Préparez les alliances !';

    message.reply({
      embeds: [
        embed.custom(config.colors.love)
          .setTitle('💖 Machine à Amour 💖')
          .setDescription(`Voyons la compatibilité entre **${user1.username}** et **${user2.username}**...\n\n**${loveScore}%** [${bar}]\n\n*${comment}*`),
      ],
    });
  },
};
