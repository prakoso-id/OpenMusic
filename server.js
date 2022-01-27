require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const songs = require('./src/api/songs');
const SongsService = require('./src/services/postgres/SongsServices');
const songValidator = require('./src/validator/songs');

const albums = require('./src/api/albums');
const AlbumsService = require('./src/services/postgres/AlbumsServices');
const albumValidator = require('./src/validator/albums');

const users = require('./src/api/users');
const UsersService = require('./src/services/postgres/UsersServices');
const UsersValidator = require('./src/validator/users');

const authentications = require('./src/api/authentications');
const AuthenticationsService = require('./src/services/postgres/AuthServices');
const TokenManager = require('./src/tokenize/TokenManager');
const AuthenticationsValidator = require('./src/validator/authentications');

const playlists = require('./src/api/playlists');
const PlaylistsService = require('./src/services/postgres/PlaylistsServices');
const PlaylistsValidator = require('./src/validator/playlists');

const collaborations = require('./src/api/collaborations');
const CollaborationsService = require('./src/services/postgres/CollaborationsServices');
const CollaborationsValidator = require('./src/validator/collaborations');


const _exports = require('./src/api/exports');
const ProducerService = require('./src/services/rabbitmq/ProducerServices');
const ExportsValidator = require('./src/validator/exports');

const uploads = require('./src/api/uploads');
const StorageService = require('./src/services/storage/StorageServices');
const UploadsValidator = require('./src/validator/uploads');

const CacheService = require('./src/services/redis/CacheServices');


const init = async () => {
  const cacheService = new CacheService();

  const songsServices = new SongsService();
  const albumsServices = new AlbumsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, './src/api/uploads/covers'));



  const server = Hapi.server({

    port: process.env.PORT,
    host: process.env.HOST,

    routes: {
      cors: {
        origin: ['*'],
      },
    },

  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });



  await server.register([
    {
      plugin: songs,
      options: {
        service: songsServices,
        validator: songValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        albumsServices,
        cacheService,
        validator: albumValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        storageService,
        albumsServices,
        validator: UploadsValidator,
        
      },
    },
  ]);

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

init();