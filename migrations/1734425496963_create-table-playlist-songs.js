exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'playlists(id)',
      onDelete: 'SET NULL',
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'songs(id)',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
