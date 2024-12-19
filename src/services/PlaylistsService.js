/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');
const { mapDBToModelPlaylists, mapDBToModelPlaylistsSong } = require('../utils');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: 'SELECT a.id, a.name, b.username FROM playlists a LEFT JOIN users b ON a.owner = b.id WHERE a.owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylists);
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus, id tidak ditemukan');
    }
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async isSongExists(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlistSong-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist Song Gagal Ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongInPlaylist(owner) {
    const query = {
      text: 'SELECT * FROM playlist_songs ps LEFT JOIN playlists p ON ps.playlist_id = p.id LEFT JOIN users u ON p."owner" = u.id  LEFT JOIN songs s ON ps.song_id = s.id WHERE p.owner = $1',
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylistsSong);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs ps WHERE ps.playlist_id = $1 AND ps.song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lahu gagal dihapus, id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
