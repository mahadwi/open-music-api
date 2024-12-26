/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async editAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.getAlbumById(id);
    await this._service.addAlbumLikeById(credentialId, id);

    const response = h.response({
      status: 'success',
      message: 'Album liked successfully',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikeByIdHandler(request, h) {
    const { id } = request.params;

    const { cache, likes } = await this._service.getAlbumLikeById(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (cache) response.header('X-Data-Source', 'cache');

    return response;
  }

  async deleteAlbumLikeByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._service.deleteAlbumLikeById(credentialId, id);

    return {
      status: 'success',
      message: 'Album deleted successfully',
    };
  }
}

module.exports = AlbumsHandler;
