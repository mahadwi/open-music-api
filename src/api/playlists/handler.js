/* eslint-disable no-underscore-dangle */
const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.PlaylistsValidator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylist(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async addSongToPlaylistHandler(request, h) {
    this._validator.PlaylistSongValidator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { songId } = request.payload;
    await this._playlistsService.isSongExists(songId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const playlistSong = await this._playlistsService.addSongToPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan ke playlist',
      data: {
        playlistSong,
      },
    });
    response.code(201);
    return response;
  }

  async getSongInPlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const playlist = await this._playlistsService.getSongInPlaylist(credentialId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistHandler(request) {
    this._validator.PlaylistSongValidator.validatePlaylistSongPayload(request.payload);
    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.isSongExists(songId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }

  async deletePlaylistsHandler(request) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._playlistsService.deletePlaylists(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
