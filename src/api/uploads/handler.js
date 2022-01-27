const ClientError = require('../../exceptions/ClientError');
const path = require('path');
class UploadsHandler {
    constructor(service, albumsService, validator) {
        
        this._storageService = service;
        this._albumsService = albumsService;
        this._validator = validator;

        this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
        this.getimage = this.getimage.bind(this);

    }

    async postUploadImageHandler(req, res) {
        try {
            const {
                albumId
            } = req.params;
            const {
                cover
            } = req.payload;


            this._validator.validateImageHeaders(cover.hapi.headers);

            const fileName = await this._storageService.writeFile(cover, cover.hapi);

            await this._albumsService.addAlbumCover(albumId,fileName);



            const response = res.response({
                status: 'success',
                message: 'Sampul berhasil diunggah',
                // data: {
                //     cover: `http://${process.env.HOST}:${process.env.PORT}/upload//${fileName}`,
                // },
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

    //DEBUG PATH IMAGE

    async getimage(req,res){
        try {
            const {param }= req.params;
            const paths = path.resolve(__dirname, 'covers/'+param);
            return res.file(paths).vary('x-magic');
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

module.exports = UploadsHandler;
