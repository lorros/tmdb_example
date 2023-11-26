// config
const hostname = '127.0.0.1';
const port = 3001;
const api_key = '4dd78398c8c40e0c5b5f83fdd358b4fd';
const api_url = 'https://api.themoviedb.org/3/search/movie';
const cache_ttl = 2 * 60 * 1000; // ms
const cleanup_interval = 15 * 1000; // ms

module.exports = {hostname, port, api_key, api_url, cache_ttl, cleanup_interval};
