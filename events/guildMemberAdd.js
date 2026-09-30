const config = require('../config');
const embed  = require('../utils/embed');
const { raidLog } = require('../utils/logger');
const { startLockdown, endLockdown } = require('../utils/lockdown');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    if (!config.antiRaid.enabled || member.user.bot) return;

    const { joinThreshold, joinTimeWindow, minAccountAgeDays, newAccountAction, lockdownDuration } = config.antiRaid;
    const guild = member.guild;
    const now   = Date.now();

    const joins = (client.joinTracker.get(guild.id) || []).filter(t => now - t < joinTimeWindow);
    joins.push(now);
    client.joinTracker.set(guild.id, joins);

    const accountAge = (now - member.user.createdTimestamp) / 86_400_000;
    if (minAccountAgeDays > 0 && accountAge < minAccountAgeDays) {
      const action = newAccountAction === 'ban' ? 'ban' : 'kick';
      const reason = `[Anti-Raid] Compte créé il y a ${accountAge.toFixed(1)} jour(s) (minimum : ${minAccountAgeDays}j)`;

      try {
        if (action === 'ban') await member.ban({ reason, deleteMessageSeconds: 0 });
        else await member.kick(reason);
      } catch (err) {
        console.error('[ANTIRAID SANCTION]', err.message);
      }

      await raidLog(guild, embed.warning('🆕 Compte récent détecté',
        `**Membre :** ${member.user.tag} (\`${member.id}\`)\n` +
        `**Âge du compte :** ${accountAge.toFixed(1)} jour(s)\n` +
        `**Sanction :** ${action === 'ban' ? 'Banni' : 'Expulsé'} automatiquement`
      ));
    }

    if (joins.length >= joinThreshold && !client.lockedDown.get(guild.id)) {
      await raidLog(guild, embed.error('🚨 RAID DÉTECTÉ : Lockdown automatique',
        `**${joins.length} membres** ont rejoint en moins de **${joinTimeWindow / 1000}s**.\n` +
        `Le serveur est en **lockdown** pendant **${Math.round(lockdownDuration / 1000)}s**.\n\n` +
        `Utilisez \`${config.prefix}unlock all\` pour lever le lockdown manuellement.`
      ));

      await startLockdown(guild, client);

      const timer = setTimeout(async () => {
        client.lockdownTimers.delete(guild.id);
        if (!client.lockedDown.get(guild.id)) return;
        await endLockdown(guild, client);
        client.joinTracker.set(guild.id, []);
        await raidLog(guild, embed.success('Lockdown levé',
          'Le lockdown automatique est terminé. Les permissions d\'origine ont été restaurées.'));
      }, lockdownDuration);
      client.lockdownTimers.set(guild.id, timer);
    }
  },
};
