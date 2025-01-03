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

const mapDBToModelSongs = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBToModelSong = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const mapDBToModelPlaylists = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapDBToModelPlaylistsSong = ({
  playlist_id,
  playlist_name,
  username,
  title,
  performer,
}) => ({
  id: playlist_id,
  name: playlist_name,
  username,
  songs: [{
    title,
    performer,
  }],
});

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelSongs,
  mapDBToModelSong,
  mapDBToModelPlaylists,
  mapDBToModelPlaylistsSong,
};
