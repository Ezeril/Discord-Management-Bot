const { createStore } = require('./store');

const mutes         = createStore('mutes.json');
const warns         = createStore('warns.json');
const blacklist     = createStore('blacklist.json');
const ticketConfig  = createStore('ticketConfig.json');
const ticketCat     = createStore('ticketCategory.json');
const lockdown      = createStore('lockdown.json');

function getMutes() { return mutes.get(); }

function addMute(guildId, userId, expiresAt) {
  const db = mutes.get();
  (db[guildId] ??= {})[userId] = { expiresAt };
  mutes.save();
}

function removeMute(guildId, userId) {
  const db = mutes.get();
  if (!db[guildId]?.[userId]) return;
  delete db[guildId][userId];
  if (!Object.keys(db[guildId]).length) delete db[guildId];
  mutes.save();
}

function getWarns() { return warns.get(); }

function addWarn(guildId, userId, moderatorId, reason) {
  const db = warns.get();
  ((db[guildId] ??= {})[userId] ??= []).push({ moderator: moderatorId, reason, date: Date.now() });
  warns.save();
}

function clearWarns(guildId, userId) {
  const db = warns.get();
  if (!db[guildId]?.[userId]) return;
  delete db[guildId][userId];
  if (!Object.keys(db[guildId]).length) delete db[guildId];
  warns.save();
}

function getBlacklist() { return blacklist.get(); }

function addBlacklist(guildId, userId) {
  const db = blacklist.get();
  const list = (db[guildId] ??= []);
  if (!list.includes(userId)) list.push(userId);
  blacklist.save();
}

function removeBlacklist(guildId, userId) {
  const db = blacklist.get();
  if (!db[guildId]) return;
  db[guildId] = db[guildId].filter(id => id !== userId);
  if (!db[guildId].length) delete db[guildId];
  blacklist.save();
}

function isBlacklisted(guildId, userId) {
  return blacklist.get()[guildId]?.includes(userId) || false;
}

function getTicketMsg(guildId) { return ticketConfig.get()[guildId] || null; }
function setTicketMsg(guildId, message) {
  ticketConfig.get()[guildId] = message;
  ticketConfig.save();
}

function getTicketCategory(guildId) { return ticketCat.get()[guildId] || null; }
function setTicketCategory(guildId, categoryId) {
  ticketCat.get()[guildId] = categoryId;
  ticketCat.save();
}

function getLockdownState(guildId) { return lockdown.get()[guildId] || null; }
function setLockdownState(guildId, state) {
  const db = lockdown.get();
  if (state) db[guildId] = state; else delete db[guildId];
  lockdown.save();
}

module.exports = {
  getMutes, addMute, removeMute,
  getWarns, addWarn, clearWarns,
  getBlacklist, addBlacklist, removeBlacklist, isBlacklisted,
  getTicketMsg, setTicketMsg,
  getTicketCategory, setTicketCategory,
  getLockdownState, setLockdownState,
};
