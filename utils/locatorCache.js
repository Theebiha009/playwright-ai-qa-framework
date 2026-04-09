import fs from 'fs';

const CACHE_FILE = './locator-cache.json';

function ensureCacheFile() {
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({}, null, 2));
  }
}

function loadCache() {
  ensureCacheFile();
  return JSON.parse(fs.readFileSync(CACHE_FILE));
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export function getCachedLocator(key) {
  const cache = loadCache();
  return cache[key];
}

export function setCachedLocator(key, locatorData) {
  const cache = loadCache();
  cache[key] = locatorData;
  saveCache(cache);
}