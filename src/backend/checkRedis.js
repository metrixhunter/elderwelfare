// checkRedis.js
import { createClient } from 'redis';

const client = createClient({
  url: process.env.UPSTASH_REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  try {
    await client.connect();

    // Test write
    await client.set('testkey', 'HelloRedis');

    // Test read
    const value = await client.get('testkey');
    console.log('🔍 Redis value:', value); // should print "HelloRedis"

    // Clean up
    await client.del('testkey');

    await client.disconnect();
  } catch (error) {
    console.error('Connection failed:', error);
  }
})();
