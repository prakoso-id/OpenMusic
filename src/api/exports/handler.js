const { Pool } = require('pg');
const ClientError = require('../../exceptions/ClientError');


class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._pool = new Pool();
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

  async postExportSongsHandler(req, res) {
    try {
      this._validator.validateExportSongsPayload(req.payload);
      const { playlistId } = req.params;
      const { id: userId } = req.auth.credentials;
      await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
      await this._playlistsService.verifyPlaylistOwner(playlistId,userId);
      await this._playlistsService.checkPlaylist(playlistId);


      const message = {
        playlistId,
        targetEmail: req.payload.targetEmail,
      };

      await this._service.sendMessage('export:songs', JSON.stringify(message));

      const response = res.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = res.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = res.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;