const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'derank',
  description: 'Retire tous les rôles d\'un membre.',
  usage: 'derank <@membre>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageRoles],
  botPerms: [PermissionFlagsBits.ManageRoles],

  async execute(message, args) {
    const target = message.mentions.members.first() || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null);

    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    if (target.id === message.guild.ownerId) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas derank le propriétaire du serveur.')] });
    }

    if (target.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas derank un membre ayant un rôle supérieur ou égal au vôtre.')] });
    }

    const botHighestPos = message.guild.members.me.roles.highest.position;
    const rolesToRemove = target.roles.cache.filter(role => 
      role.id !== message.guild.id &&
      role.position < botHighestPos && 
      !role.managed
    );

    if (rolesToRemove.size === 0) {
      return message.reply({ embeds: [embed.warning('Attention', 'Ce membre n\'a aucun rôle que je peux lui retirer.')] });
    }

    try {
      await target.roles.remove(rolesToRemove);
      message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été derank (retrait de **${rolesToRemove.size}** rôles).`)] });
    } catch (error) {
      console.error(error);
      message.reply({ embeds: [embed.error('Erreur', 'Une erreur est survenue lors du retrait des rôles.')] });
    }
  },
};