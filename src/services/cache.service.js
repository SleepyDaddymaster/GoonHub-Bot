class CacheService {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttl = null) {
    this.cache.set(key, value);

    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl);
    }
  }

  get(key) {
    return this.cache.get(key);
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new CacheService();