const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const {mapAlbumsToModel} = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const { number } = require('joi');

class AlbumsServices {
    constructor() {
        this._pool = new Pool();

    }

    async addAlbum({
        name,
        year,
    }) {
        const id = 'album-'+nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const query = {
            text: 'INSERT INTO albums (id, name, year, inserted_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, year, insertedAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT id, name, year FROM albums');
        return result.rows;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return result.rows.map(mapAlbumsToModel)[0];
    }

    async getSongsbyAlbumId(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE "albumId" = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }



    async editAlbumById(id, {
        name,
        year,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async addAlbumCover(id,filename){
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE albums SET cover = $1, updated_at = $2 WHERE id = $3 RETURNING id',
            values: [filename, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal mengubah Cover Album. Id tidak ditemukan');
        }
    }

    async checkLikesAlbum(albumId,user_id){
        
        const checkAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [albumId],
          };
          const resultcheckAlbum = await this._pool.query(checkAlbum);
          if (!resultcheckAlbum.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
          }
        const checkLike = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
            values: [albumId,user_id],
        };
        const resultcheckLike = await this._pool.query(checkLike);
        
        // return resultcheckLike.rows.length;
        if (!resultcheckLike.rows.length) {
            return 'add'
        }else{
            return 'delete'
        }
    }

    async deleteLikeAlbumById(albumId,user_id){
        const query = {
            text: 'DELETE FROM user_album_likes WHERE album_id = $1 and user_id = $2 RETURNING id',
            values: [albumId,user_id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal Batal Menyukai Album. Id tidak ditemukan');
        }
    }
    async addLikeAlbumById(albumId,user_id){
        const id = 'likes-'+nanoid(16);
        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $3, $2) RETURNING id',
            values: [id, albumId, user_id],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal Menyukai Album');
        }

        return result.rows[0].id;
    }

    async getLikesAlbumById(albumId){
        
        const checkAlbum = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [albumId],
          };
          const resultcheckAlbum = await this._pool.query(checkAlbum);
          if (!resultcheckAlbum.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
          }
        const checkLike = {
            text: 'SELECT count(*) as jumlah FROM user_album_likes WHERE album_id = $1',
            values: [albumId],
        };
        const resultcheckLike = await this._pool.query(checkLike);

        // await this._cacheService.set(`likes:${albumId}`, JSON.stringify(resultcheckLike.rows[0].jumlah));
        
        return parseInt(resultcheckLike.rows[0].jumlah);

        
    }

    
}

module.exports = AlbumsServices;