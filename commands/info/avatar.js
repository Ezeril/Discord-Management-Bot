const config = require('../../config');
const embed = require('../../utils/embed');
const { resolveUser } = require('../../utils/permissions');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],
  description: 'Affiche l\'avatar d\'un membre.',
  usage: 'avatar [@membre|ID]',
  category: 'Info',

  async execute(message, args) {
    const target = (await resolveUser(message, args)) || message.author;

    const e = embed.custom(config.colors.main, { footerText: `Demandé par ${message.author.tag}` })
      .setTitle(`Avatar de ${target.tag}`)
      .setImage(target.displayAvatarURL({ size: 1024 }));

    message.reply({ embeds: [e] });
  },
};
