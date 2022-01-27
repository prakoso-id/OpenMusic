const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{albumId}/covers',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method:'GET',
    path:'/upload/{param*}',
    // handler:handler.getimage,
    handler: {
      directory: {
        path: path.resolve(__dirname),
      },
    },
    // console.log()??
   
  }
];

module.exports = routes;