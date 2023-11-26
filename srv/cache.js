const {cache_ttl, cleanup_interval} = require('./config');

class Cache {
    constructor(underlyingQuery) {
        this.cacheData = new Map(); // p + '_' + query => {t, data, cnt}
        this.last_cleanup = (new Date()).getTime();
        this.underlyingQuery = underlyingQuery;
    }

    // cache cleanup
    // todo: preferably we'd have an OrderedMap from immutable.js for t => query,
    // but we don't expect too many elements (120 sec cache timeout: few thousand)
    // also, ideally we'd do it on c++-side, boost::bimap or gcc's order statistics set, which is way faster
    cache_cleanup_hook = (query_t) => {
        if (query_t - this.last_cleanup > cleanup_interval) {
            this.last_cleanup = query_t;
            console.log("Cache cleanup");
            this.cacheData = new Map([...this.cacheData].filter(([k, v]) => query_t - v.t <= cache_ttl));
        }
    };

    query = async (qs, p, query_t) => {
        this.cache_cleanup_hook(query_t);
        const cqs = p + '_' + qs;
        if (!this.cacheData.has(cqs) || query_t - this.cacheData.get(cqs).t > cache_ttl) {
            console.log('Cache miss');
            const data = await this.underlyingQuery(qs, p);
            this.cacheData.set(cqs, {t: query_t, data, cnt: 1});
            return data;
        }

        let data = this.cacheData.get(cqs);
        data.cnt++;
        console.log("Counter: " + data.cnt);
        return data.data;
    };
};

module.exports = Cache;
