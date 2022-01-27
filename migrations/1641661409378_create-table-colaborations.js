exports.up = pgm => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'TEXT',
            notNull: false,
        },
        user_id: {
            type: 'TEXT',
            notNull: false,
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('collaborations');

};

