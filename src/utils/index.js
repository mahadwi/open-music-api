/* eslint-disable camelcase */
const mapDBToModelAlbum = ({
  id,
  name,
  year,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToModelAlbum };
