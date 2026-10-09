const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'pfc',
  aliases: ['shifumi', 'rps'],
  description: 'Joue à pierre-feuille-ciseaux contre le bot !',
  usage: 'pfc <pierre|feuille|ciseaux>',
  category: 'Fun',
  cooldown: 3,

  async execute(message, args = []) {
    const playerChoice = (args[0] || '').toLowerCase();
    const choices = ['pierre', 'feuille', 'ciseaux'];

    if (args.length !== 1 || !choices.includes(playerChoice)) {
      return message.reply({
        embeds: [
          embed.error(
            'Choix invalide',
            'Choisis entre pierre, feuille et ciseaux !\n' +
            `Exemple : \`${config.prefix}pfc pierre\``
          ),
        ],
      });
    }

    const botChoice = choices[
      Math.floor(Math.random() * choices.length)
    ];

    const emojis = {
      pierre: '🪨',
      feuille: '📄',
      ciseaux: '✂️',
    };

    const winsAgainst = {
      pierre: 'ciseaux',
      feuille: 'pierre',
      ciseaux: 'feuille',
    };

    let result;

    if (playerChoice === botChoice) {
      result = '🤝 Égalité ! On a eu la même idée.';
    } else if (winsAgainst[playerChoice] === botChoice) {
      result = '🎉 Tu as gagné ! Je prendrai ma revanche...';
    } else {
      result = '🤖 J’ai gagné ! Retente ta chance.';
    }

    return message.reply({
      embeds: [
        embed.info(
          '🪨 Pierre • Feuille • Ciseaux',
          `Ton choix : ${emojis[playerChoice]} ${playerChoice}\n` +
          `Mon choix : ${emojis[botChoice]} ${botChoice}\n\n` +
          result
        ),
      ],
    });
  },
};
