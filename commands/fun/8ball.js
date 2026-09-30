const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: '8ball',
  aliases: ['ask'],
  description: 'Pose une question à la boule magique du bot !',
  usage: '8ball <ta question>',
  category: 'Fun',
  cooldown: 3,

  async execute(message, args) {
    if (!args.length) {
      return message.reply({ 
        embeds: [embed.error('Erreur', 'Tu dois poser une question !\nExemple : `' + config.prefix + '8ball Vais-je avoir une bonne note demain ?`')] 
      });
    }

    const question = args.join(' ');
    
    const responses = [
      '🟢 Oui, absolument !',
      '🟢 C\'est certain.',
      '🟢 Il y a de fortes chances.',
      '🟡 Peut-être bien...',
      '🟡 Concentre-toi et redemande.',
      '🟡 Je ne suis pas sûr, réessaie plus tard.',
      '🔴 Je préfère ne pas répondre à ça...',
      '🔴 N\'y compte pas trop.',
      '🔴 Non, absolument pas.',
      '🔴 C\'est mort.'
    ];
      
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    message.reply({
      embeds: [
        embed.info('🎱 Boule Magique', `**Question :** ${question}\n**Réponse :** ${randomResponse}`)
      ]
    });
  },
};
