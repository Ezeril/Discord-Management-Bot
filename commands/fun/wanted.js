const { AttachmentBuilder } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');

const WANTED_API_URL = 'https://api.popcat.xyz/wanted?image={avatar}';
const WANTED_FOOTER = 'Récompense : $5,000 !';

module.exports = {
  name: 'wanted',
  aliases: ['recherche'],
  description: 'Génère une affiche WANTED avec la photo de profil d\'un membre.',
  usage: 'wanted [@membre]',
  category: 'Fun',
  cooldown: 5,
  botPerms: [],

  async execute(message) {
    const target = message.mentions.users.first() || message.author;
    const avatarUrl = target.displayAvatarURL({ extension: 'png', forceStatic: true, size: 512 }).split('?')[0];

    const waitMsg = await message.reply('⏳ **Création de l\'affiche en cours...**');

    try {
      const url = WANTED_API_URL.replace('{avatar}', encodeURIComponent(avatarUrl));

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) {
        throw new Error(`Réponse invalide de l'API (HTTP ${res.status})`);
      }
      const attachment = new AttachmentBuilder(Buffer.from(await res.arrayBuffer()), { name: 'wanted.png' });

      const e = embed.custom(config.colors.wanted, { footerText: WANTED_FOOTER, footerIcon: message.guild.iconURL() || '' })
        .setTitle(`🤠 AVIS DE RECHERCHE : ${target.username.toUpperCase()}`)
        .setDescription('Cet individu est recherché mort ou vif par le staff.')
        .setImage('attachment://wanted.png');

      await waitMsg.edit({ content: null, embeds: [e], files: [attachment] });
    } catch (error) {
      console.error('[WANTED ERROR]', error.message);
      waitMsg.edit({
        content: null,
        embeds: [embed.error('Erreur', 'Impossible de générer l\'image pour le moment. L\'API est peut-être hors ligne (voir `WANTED_API_URL` dans commands/fun/wanted.js).')],
      });
    }
  },
};
