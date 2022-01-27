const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {  albumsServices, cacheService, validator }) => {
    const albumsHandler = new AlbumHandler( albumsServices, cacheService, validator);
    server.route(routes(albumsHandler));
  },
};