const fs   = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

function createStore(fileName, fallback = {}) {
  const file = path.join(dataDir, fileName);
  let cache;

  function load() {
    if (cache !== undefined) return cache;
    try {
      cache = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      cache = structuredClone(fallback);
    }
    return cache;
  }

  function save() {
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
    fs.renameSync(tmp, file);
  }

  return {
    get: () => load(),
    save: (data) => { if (data) cache = data; load(); save(); },
  };
}

module.exports = { createStore };
