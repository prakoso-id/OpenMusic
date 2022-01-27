
exports.up = pgm => {
    pgm.createTable('user_album_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        user_id:{
            type: 'TEXT',
            notNull: false,
        },
        album_id:{
            type: 'TEXT',
            notNull: false,
        }
    });
};

exports.down = pgm => {
    pgm.dropTable('user_album_likes');

};
