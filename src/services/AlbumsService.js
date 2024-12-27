/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModelAlbum } = require('../utils');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModelAlbum);
  }

  async getAlbumById(id) {
    const query = {
      text: `
        SELECT 
          a.id AS "albumId", 
          a.name AS "albumName", 
          a.year AS "albumYear",
          a.cover AS "coverUrl",
          s.id AS "songId",
          s.title AS "songTitle",
          s.performer AS "songPerformer"
        FROM albums a
        LEFT JOIN songs s ON a.id = s."albumId"
        WHERE a.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = {
      id: result.rows[0].albumId,
      name: result.rows[0].albumName,
      year: result.rows[0].albumYear,
      coverUrl: result.rows[0].coverUrl,
      songs: result.rows
        .filter((row) => row.songId)
        .map((song) => ({
          id: song.songId,
          title: song.songTitle,
          performer: song.songPerformer,
        })),
    };

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString;
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus, id tidak ditemukan');
    }
  }

  async addCoverUrlAlbum(id, dir) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [dir, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Failed to add cover. ID not found');
    }
  }

  async addAlbumLikeById(userId, albumId) {
    const id = `like-${nanoid(16)}`;

    const queryCheckLike = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(queryCheckLike);

    if (result.rowCount) {
      throw new InvariantError('Failed to like the album');
    } else {
      const query = {
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      };

      await this._pool.query(query);
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async deleteAlbumLikeById(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed delete like');
    }

    await this._cacheService.delete(`album-likes:${albumId}`);
  }

  async getAlbumLikeById(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);
      const likes = parseInt(result, 10);
      return {
        cache: true,
        likes,
      };
    } catch {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Failed to pick up the number of likes');
      }

      const likes = parseInt(result.rows[0].count, 10);

      await this._cacheService.set(`album-likes:${albumId}`, likes);

      return {
        cache: false,
        likes,
      };
    }
  }
}

module.exports = AlbumsService;
