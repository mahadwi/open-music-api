exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'albums(id)',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
