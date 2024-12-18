/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModelAlbum } = require('../utils');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
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
      songs: result.rows
        .filter((row) => row.songId) // Hanya ambil lagu yang memiliki ID
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
}

module.exports = AlbumsService;
