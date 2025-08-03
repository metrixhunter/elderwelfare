// checkRedis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.UPSTASH_REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
    const pong = await client.ping();
    console.log('Redis connection successful:', pong); // should print "PONG"
    await client.disconnect();
  } catch (error) {
    console.error('Connection failed:', error);
  }
})();
