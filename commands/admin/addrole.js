const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'addrole',
  description: 'Ajoute un rôle à un membre.',
  usage: 'addrole <@membre> <@role>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageRoles],
  botPerms: [PermissionFlagsBits.ManageRoles],

  async execute(message, args) {
    const target = message.mentions.members.first() || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null);
    const role = message.mentions.roles.first() || (args[1] ? message.guild.roles.cache.get(args[1]) : null);

    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (!role) return message.reply({ embeds: [embed.error('Erreur', 'Rôle introuvable.')] });

    if (role.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas donner un rôle supérieur ou égal au vôtre.')] });
    }
    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas donner ce rôle car il est supérieur ou égal au mien dans la hiérarchie.')] });
    }

    if (target.roles.cache.has(role.id)) {
      return message.reply({ embeds: [embed.warning('Attention', 'Ce membre possède déjà ce rôle.')] });
    }

    await target.roles.add(role);
    message.reply({ embeds: [embed.success('Succès', `Le rôle ${role} a été ajouté à **${target.user.tag}**.`)] });
  },
};
