exports.up = pgm => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: false,
        },
        owner: {
            type: 'TEXT',
            notNull: false,
            references: '"users"',
            onDelete: 'cascade'
        },
    });
    pgm.createTable('playlistsongs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'TEXT',
            notNull: false, 
            references: '"playlists"',
            onDelete: 'cascade'
        },
        song_id: {
            type: 'text',
            notNull: false,
            references: '"songs"',
            onDelete: 'cascade'
        },
    });
    pgm.createTable('playlisactivities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'TEXT',
            notNull: false,
            references: '"playlists"',
            onDelete: 'cascade'
        },
        song_id: {
            type: 'text',
            notNull: false,
            references: '"songs"',
            onDelete: 'cascade'
        },
        user_id: {
            type: 'text',
            notNull: false,
            references: '"users"',
            onDelete: 'cascade'
        },
        action: {
            type: 'text',
            notNull: false,
        },
        time: {
            type: 'text',
            notNull: false,
        },
    });
    
};

exports.down = pgm => {
   

    pgm.dropTable('playlists');
    pgm.dropTable('playlistsongs');
    pgm.dropTable('playlisactivities');

    

};

