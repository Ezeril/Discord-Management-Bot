const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'say',
  aliases: ['parle', 'repete'],
  description: 'Fait envoyer un message textuel par le bot.',
  usage: 'say <texte>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.Administrator],
  botPerms: [PermissionFlagsBits.ManageMessages],

  async execute(message, args) {
    const text = message.content.split(/\s+/).length > 1
      ? message.content.slice(message.content.search(/\s/)).trim()
      : '';

    if (!text) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez préciser le message que je dois répéter.')] });
    }

    try {
      await message.delete().catch(() => {});
      await message.channel.send({
        content: text,
        allowedMentions: { parse: message.member.permissions.has(PermissionFlagsBits.MentionEveryone)
          ? ['users', 'roles', 'everyone'] : ['users', 'roles'] },
      });
    } catch (error) {
      console.error('[SAY ERROR]', error);
      message.channel.send({ embeds: [embed.error('Erreur', 'Je n\'ai pas pu envoyer le message.')] })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  },
};
