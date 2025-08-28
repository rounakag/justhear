const NodeCache = require('node-cache');
const config = require('../config');

// Create cache instance
const cache = new NodeCache({ 
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkperiod,
  useClones: false
});

// Cache middleware for API responses
const cacheMiddleware = (duration = config.cache.ttl) => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json({
        ...cachedResponse,
        cached: true,
        cacheTimestamp: new Date().toISOString()
      });
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override send function to cache response
    res.json = function(data) {
      cache.set(key, data, duration);
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Cache utility functions
const cacheUtils = {
  get: (key) => cache.get(key),
  set: (key, value, ttl = config.cache.ttl) => cache.set(key, value, ttl),
  del: (key) => cache.del(key),
  flush: () => cache.flushAll(),
  stats: () => cache.getStats()
};

module.exports = {
  cache,
  cacheMiddleware,
  cacheUtils
};
