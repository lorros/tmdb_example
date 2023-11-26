import * as assert from 'assert';
import Cache from './cache.js';
import { cache_ttl } from './config.js';

let queries = [];

async function qpush(qs, p) {
    queries.push({qs, p});
    return {qs, p};
}

{
    // test case 1 - query a page, result should be returned and should be in cache, counter 1
    queries = [];
    let iut = new Cache(qpush);
    let t = 0;
    {
        t += 100;
        const data = await iut.query("expr1", 1, t);
        assert.deepEqual(data, {qs: "expr1", p: 1});
        let cached = iut.cacheData.get("1_expr1");
        assert.deepEqual(cached.data, {qs: "expr1", p: 1});
        assert.equal(cached.cnt, 1);
        assert.equal(queries.length, 1);
    }

    // test case 2 - query same page within given time, cache shouldn't re-query, counter increased
    queries = [];
    {
        t += 10;
        const data = await iut.query("expr1", 1, t);
        assert.deepEqual(data, {qs: "expr1", p: 1});
        let cached = iut.cacheData.get("1_expr1");
        assert.deepEqual(cached.data, {qs: "expr1", p: 1});
        assert.equal(cached.cnt, 2);
        assert.equal(queries.length, 0);
    }

    // test case 3 - query same page more than cache_ttl later, cache should re-query, counter 1
    queries = [];
    {
        t += 10 + cache_ttl;
        const data = await iut.query("expr1", 1, t);
        assert.deepEqual(data, {qs: "expr1", p: 1});
        let cached = iut.cacheData.get("1_expr1");
        assert.deepEqual(cached.data, {qs: "expr1", p: 1});
        assert.equal(cached.cnt, 1);
        assert.equal(queries.length, 1);
    }

    // test case 4 - query different page, cache should query, counter 1
    queries = [];
    {
        t += 10;
        const data = await iut.query("expr1", 2, t);
        assert.deepEqual(data, {qs: "expr1", p: 2});
        let cached = iut.cacheData.get("2_expr1");
        assert.deepEqual(cached.data, {qs: "expr1", p: 2});
        assert.equal(cached.cnt, 1);
        assert.equal(queries.length, 1);
    }

    // test case 5 - query different expr, cache should query, counter 1, existing pages in cache
    queries = [];
    {
        t += 10;
        const data = await iut.query("expr2", 1, t);
        assert.deepEqual(data, {qs: "expr2", p: 1});
        let cached1e2 = iut.cacheData.get("1_expr2");
        let cached1e1 = iut.cacheData.get("1_expr1");
        let cached2e1 = iut.cacheData.get("2_expr1");
        assert.deepEqual(cached1e2.data, {qs: "expr2", p: 1});
        assert.deepEqual(cached1e1.data, {qs: "expr1", p: 1});
        assert.deepEqual(cached2e1.data, {qs: "expr1", p: 2});
        assert.equal(cached1e2.cnt, 1);
        assert.equal(cached1e1.cnt, 1);
        assert.equal(cached2e1.cnt, 1);
        assert.equal(queries.length, 1);
    }
}
