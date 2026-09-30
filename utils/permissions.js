const embed = require('./embed');

async function resolveMember(message, args, index = 0) {
  return message.mentions.members.first()
    || (args[index] ? await message.guild.members.fetch(args[index]).catch(() => null) : null);
}

async function resolveUser(message, args, index = 0) {
  return message.mentions.users.first()
    || (args[index] ? await message.client.users.fetch(args[index]).catch(() => null) : null);
}

function hierarchyError(message, target, { action = 'agir sur' } = {}) {
  const guild = message.guild;
  if (target.id === message.author.id) return `Vous ne pouvez pas ${action} vous-même.`;
  if (target.id === guild.ownerId)     return `Vous ne pouvez pas ${action} le propriétaire du serveur.`;
  if (target.id === message.client.user.id) return `Je ne peux pas ${action} moi-même.`;

  const isOwner = message.author.id === guild.ownerId;
  if (!isOwner && target.roles.highest.position >= message.member.roles.highest.position) {
    return `Vous ne pouvez pas ${action} ce membre : son rôle est supérieur ou égal au vôtre.`;
  }
  if (target.roles.highest.position >= guild.members.me.roles.highest.position) {
    return `Je ne peux pas ${action} ce membre : son rôle est supérieur ou égal au mien.`;
  }
  return null;
}

function replyIfBlocked(message, target, opts) {
  const err = hierarchyError(message, target, opts);
  if (!err) return null;
  return message.reply({ embeds: [embed.error('Action impossible', err)] });
}

module.exports = { resolveMember, resolveUser, hierarchyError, replyIfBlocked };
