function getRedisConnection() {
  const { hostname, port, password, protocol } = new URL(process.env.REDIS_URL);
  return {
    host: hostname,
    port: Number(port) || 6379,
    password: password || undefined,
    tls: protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

module.exports = { getRedisConnection };
