// Simple in-memory cache for API calls with TTL
class APICache {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttl = 30000) { // Default 30 seconds TTL
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  // Prevent duplicate requests
  async wrapRequest(key, requestFn, ttl = 30000) {
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make request
    const promise = requestFn().then(data => {
      this.set(key, data, ttl);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  invalidate(pattern) {
    // Invalidate all keys matching pattern (string or regex)
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (typeof pattern === 'string' && key.includes(pattern)) {
        this.cache.delete(key);
      } else if (pattern instanceof RegExp && pattern.test(key)) {
        this.cache.delete(key);
      }
    });
  }
}

export const apiCache = new APICache();
export default apiCache;
