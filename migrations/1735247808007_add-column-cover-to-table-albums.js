exports.up = (pgm) => {
  pgm.addColumn('albums', {
    // eslint-disable-next-line camelcase
    cover: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
};
