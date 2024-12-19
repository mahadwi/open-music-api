exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      notNull: true,
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};
