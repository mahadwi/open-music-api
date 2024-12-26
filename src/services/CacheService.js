/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const redis = require('redis');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        // eslint-disable-next-line no-undef
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.connect();
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecond,
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Cache not found');

    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = CacheService;
