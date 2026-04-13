import fs from 'fs';
import PATHS from '../config/paths.js';

function ensureCacheFile() {
  if (!fs.existsSync(PATHS.storage.locatorCache)) {
    fs.writeFileSync(PATHS.storage.locatorCache, JSON.stringify({}, null, 2));
  }
}

function loadCache() {
  ensureCacheFile();
  return JSON.parse(fs.readFileSync(PATHS.storage.locatorCache));
}

function saveCache(cache) {
  fs.writeFileSync(PATHS.storage.locatorCache, JSON.stringify(cache, null, 2));
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