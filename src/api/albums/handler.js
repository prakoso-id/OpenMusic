const e = require('cors');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
    constructor( albumsServices,cacheService, validator) {
        this._service = albumsServices;
        this._validator = validator;
        this._cacheService= cacheService;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
        this.postLikesAlbumsHandler = this.postLikesAlbumsHandler.bind(this);
        this.getLikesAlbumsHandler = this.getLikesAlbumsHandler.bind(this);

        
    }

    async postAlbumHandler(req, res) {
        try {
            this._validator.validateAlbumPayload(req.payload);
            const {
                name,
                year,
            } = req.payload;

            const albumId = await this._service.addAlbum({
                name,
                year,
            });

            const response = res.response({
                status: 'success',
                message: 'Album berhasil ditambahkan',
                data: {
                    albumId,
                },
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

    async getAlbumsHandler() {
        const album = await this._service.getAlbums();
        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async getAlbumByIdHandler(req, res) {
        try {
            const {
                id
            } = req.params;
            const album = await this._service.getAlbumById(id);
            const song = await this._service.getSongsbyAlbumId(id);
            album.songs=song;
            if(album.coverUrl != null){
                album.coverUrl=`http://${process.env.HOST}:${process.env.PORT}/upload/covers/${album.coverUrl}`;
            }
            return {
                status: 'success',
                data: {
                    album,
                },
            };
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

    async putAlbumByIdHandler(req, res) {
        try {
            this._validator.validateAlbumPayload(req.payload);
            const {
                id
            } = req.params;

            await this._service.editAlbumById(id, req.payload);

            return {
                status: 'success',
                message: 'Album berhasil diperbarui',
            };
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

    async deleteAlbumByIdHandler(req, res) {
        try {
            const {
                id
            } = req.params;
            await this._service.deleteAlbumById(id);
            return {
                status: 'success',
                message: 'Album berhasil dihapus',
            };
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

    async postLikesAlbumsHandler(req, res){
        try {
            const { albumId } = req.params;
            const { id: credentialId } = req.auth.credentials;
            const cekLikesAlbum = await this._service.checkLikesAlbum(albumId,credentialId);
            console.log(cekLikesAlbum);
            if(cekLikesAlbum == 'delete'){
                await this._cacheService.delete(`likes:${albumId}`);
                await this._service.deleteLikeAlbumById(albumId,credentialId);
                const response = res.response({
                    status: 'success',
                    message: 'Batal Menyukai Album',
                });
                response.code(201);
                return response;
            }else{
                await this._cacheService.delete(`likes:${albumId}`);
                await this._service.addLikeAlbumById(albumId,credentialId);
                const response = res.response({
                    status: 'success',
                    message: 'Menyukai Album',
                });
                response.code(201);
                return response;
            }
            
            
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

    async getLikesAlbumsHandler(req,res){
        try {
            const {
                albumId
            } = req.params;
            try{
                const likeschace = await this._cacheService.get(`likes:${albumId}`);
                var number = parseInt(likeschace);
                const response = res.response({
                    status: 'success',
                    data: {
                        likes:number
                    },
                });
                response.code(200);
                response.header('X-Data-Source', 'cache');
                return response;
            }catch(error){
                const likes = await this._service.getLikesAlbumById(albumId);
                await this._cacheService.set(`likes:${albumId}`, likes);
                const response = res.response({
                    status: 'success',
                    data: {
                        likes
                    },
                });
                response.code(200);
                return response;
            }
            
            
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

module.exports = AlbumsHandler;