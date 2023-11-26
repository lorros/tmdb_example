const { api_key, api_url } = require('./config');

async function tmdbQuery(qs, p) {
    const apiResponse = await fetch(api_url + '?query=' + qs + '&page=' + p + '&api_key=' + api_key);
    const data = await apiResponse.json();
    return data;
}

module.exports = tmdbQuery;
