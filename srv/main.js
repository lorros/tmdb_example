const http = require('http');
const { URL } = require('url');
const { parse: parseQuery } = require('querystring');
const Cache = require('./cache');
const tmdbQuery = require('./tmdbQuery');
const { hostname, port } = require('./config');


let cache = new Cache(tmdbQuery);


// todo: this would probably go to a distinct file (follow coding standards as required)
const server = http.createServer(async function(req, res) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // todo: to be fixed in prod
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        'Content-Type': 'application/json'
    };

    const url = new URL(req.url, "http://" + hostname + ":" + port);
    const query = parseQuery(url.search.substr(1));
    let retVal = {};

    const query_t = (new Date()).getTime();
    console.log("Cache request: " + query.qs + ' page: ' + query.p);

    if (!query.qs) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({}));
        return;
    }
    const p = query.p ? query.p : 1;

    const data = await cache.query(query.qs, p, query_t);

    res.writeHead(200, headers);
    res.end(JSON.stringify(data));
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

