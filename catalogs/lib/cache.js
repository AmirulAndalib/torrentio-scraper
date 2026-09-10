import KeyvMongo from "@keyv/mongo";

const CATALOG_TTL = 24 * 60 * 60 * 1000; // 24 hours

const MONGO_URI = process.env.MONGODB_URI;

const remoteCache = MONGO_URI && new KeyvMongo(MONGO_URI, { collection: 'torrentio_catalog_collection', socketTimeoutMS: 10000 });

async function cacheWrap(cache, key, method, ttl) {
  if (!cache) {
    return method();
  }
  const value = await cache.get(key);
  if (value !== undefined) {
    return value;
  }
  const result = await method();
  await cache.set(key, result, ttl).catch(() => {}); // best-effort: a caching failure must not discard the result
  return result;
}

export function cacheWrapCatalog(key, method) {
  return cacheWrap(remoteCache, key, method, CATALOG_TTL);
}

export function cacheWrapIds(key, method) {
  return cacheWrap(remoteCache, `ids|${key}`, method, CATALOG_TTL);
}
