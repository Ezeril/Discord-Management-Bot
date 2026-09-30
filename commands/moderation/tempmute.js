const { PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const config = require('../../config');
const embed = require('../../utils/embed');
const { addMute } = require('../../utils/db');
const { modLog } = require('../../utils/logger');
const { resolveMember, replyIfBlocked } = require('../../utils/permissions');

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

module.exports = {
  name: 'tempmute',
  aliases: ['tmute'],
  description: 'Rend un membre muet temporairement (ex : 30s, 10m, 2h, 1d).',
  usage: 'tempmute <@membre|ID> <durée> [raison]',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],
  botPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (await replyIfBlocked(message, target, { action: 'rendre muet' })) return;
    if (!target.moderatable) return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas rendre ce membre muet.')] });

    const durationInput = args[1];
    if (!durationInput) return message.reply({ embeds: [embed.error('Erreur', 'Veuillez préciser une durée (ex : 10m, 2h, 1d).')] });

    const valid = /^\d+\s?(s|m|h|d)$/i.test(durationInput);
    const msDuration = valid ? ms(durationInput) : undefined;
    if (!msDuration || msDuration < 1000) {
      return message.reply({ embeds: [embed.error('Erreur', 'Format de durée invalide. Utilisez s (secondes), m (minutes), h (heures) ou d (jours).')] });
    }
    if (msDuration > MAX_TIMEOUT) {
      return message.reply({ embeds: [embed.error('Erreur', 'Le timeout maximum autorisé par Discord est de 28 jours.')] });
    }

    const reason = args.slice(2).join(' ') || config.moderation.defaultReason;

    await target.timeout(msDuration, `[Par ${message.author.tag}] ${reason}`);
    addMute(message.guild.id, target.id, Date.now() + msDuration);

    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été rendu muet pour **${durationInput}**.\n**Raison :** ${reason}`)] });

    modLog(message.guild, client, {
      title: `${config.emojis.time} Membre mute temporairement`,
      color: config.colors.mute,
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: durationInput, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
