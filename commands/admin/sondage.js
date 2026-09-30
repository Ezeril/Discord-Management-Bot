const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'sondage',
  aliases: ['poll'],
  description: 'Crée un sondage interactif pour la communauté.',
  usage: 'sondage <question>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageMessages],
  botPerms: [PermissionFlagsBits.AddReactions],

  async execute(message, args) {
    const question = args.join(' ');
    if (!question) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez poser une question pour le sondage.')] });
    }

    try {
      await message.delete().catch(() => {});

      const pollEmbed = embed.custom(config.colors.poll, {
        footerText: `Sondage lancé par ${message.author.tag}`,
        footerIcon: message.author.displayAvatarURL(),
      })
        .setTitle('📊 Nouveau Sondage')
        .setDescription(`**${question}**`);

      const pollMsg = await message.channel.send({ embeds: [pollEmbed] });
      for (const emoji of ['👍', '🤷', '👎']) await pollMsg.react(emoji);
    } catch (error) {
      console.error('[POLL ERROR]', error);
      message.channel.send({ embeds: [embed.error('Erreur', 'Je n\'ai pas pu créer le sondage.')] })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  },
};
