const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const {mapSongsToModel} = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsServices {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title,
        year,
        performer,
        genre,
        duration,
        albumId,
    }) {
        const id = 'song-'+nanoid(16);
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, albumId, title, year, performer, genre, duration, insertedAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getSongs(title,performer) {
        console.log(title);
        console.log(performer);
        if(title != undefined && performer != undefined){
            const query = {
                text: 'SELECT * FROM songs WHERE title LIKE $1 OR performer LIKE $2',
                values: [`%${title}%`,`%${performer}%`],
            };
            const result = await this._pool.query(query);
            
            return result.rows; 
        }else if(title != undefined || performer != undefined){
            if(title != undefined){
                const query = {
                    text: 'SELECT * FROM songs WHERE title LIKE $1 ',
                    values: [`%${title}%`],
                };
                const result = await this._pool.query(query);
                
                return result.rows;
            }else if(performer != undefined){
                const query = {
                    text: 'SELECT * FROM songs WHERE performer LIKE $1',
                    values: [`%${performer}%`],
                };
                const result = await this._pool.query(query);
                
                return result.rows;
            }
        }else{
            const query = {
                text: 'SELECT id, title, performer FROM songs',
            };
            const result = await this._pool.query(query);
            if (!result.rows.length) {
                throw new NotFoundError('Lagu tidak ditemukan');
            }
            return result.rows;
        }
        
       
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows.map(mapSongsToModel)[0];
    }

    async editSongById(id, {
        title,
        year,
        performer,
        genre,
        duration,
    }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsServices;