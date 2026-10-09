const https = require('https');
const embed = require('../../utils/embed');

function getJoke() {
  return new Promise((resolve, reject) => {
    const url = 'https://v2.jokeapi.dev/joke/Any?lang=fr&safe-mode';

    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        return reject(
          new Error(`L’API a renvoyé le statut ${response.statusCode}`)
        );
      }

      let body = '';
      response.setEncoding('utf8');

      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('error', reject);

      response.on('end', () => {
        try {
          const data = JSON.parse(body);

          if (data.error) {
            return reject(new Error('L’API n’a pas trouvé de blague.'));
          }

          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.setTimeout(8000, () => {
      request.destroy(new Error('L’API met trop de temps à répondre.'));
    });

    request.on('error', reject);
  });
}

module.exports = {
  name: 'blague',
  aliases: ['joke', 'humour'],
  description: 'Raconte une blague aléatoire en français !',
  usage: 'blague',
  category: 'Fun',
  cooldown: 5,

  async execute(message) {
    let text;

    try {
      const joke = await getJoke();

      if (joke.type === 'single' && typeof joke.joke === 'string') {
        text = joke.joke;
      } else if (
        joke.type === 'twopart' &&
        typeof joke.setup === 'string' &&
        typeof joke.delivery === 'string'
      ) {
        text = `${joke.setup}\n\n||${joke.delivery}||`;
      } else {
        throw new Error('Format de blague inattendu.');
      }
    } catch (error) {
      console.error('[blague]', error);

      return message.reply({
        embeds: [
          embed.error(
            'API indisponible',
            'Impossible de récupérer une blague pour le moment. Réessaie dans quelques instants !'
          ),
        ],
      });
    }

    return message.reply({
      allowedMentions: {
        parse: [],
        repliedUser: false,
      },
      embeds: [
        embed.info('😂 La blague du jour', text),
      ],
    });
  },
};
