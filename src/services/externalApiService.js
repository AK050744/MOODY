const axios = require('axios');
const logger = require('../utils/logger');

// ── Spotify ───────────────────────────────────────────────────────────────────
let spotifyToken = null;
let spotifyTokenExpiry = 0;

const getSpotifyToken = async () => {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;

  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
    }
  );
  spotifyToken = res.data.access_token;
  spotifyTokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return spotifyToken;
};

const searchSpotifyTrack = async (query) => {
  try {
    const token = await getSpotifyToken();
    const res = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: 'track', limit: 1, market: 'IN' },
      headers: { Authorization: `Bearer ${token}` },
    });
    const track = res.data.tracks?.items?.[0];
    if (!track) return null;
    return {
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      imageUrl: track.album.images[0]?.url,
      externalUrl: track.external_urls.spotify,
      externalId: track.id,
      source: 'spotify',
    };
  } catch (err) {
    logger.warn('Spotify search failed:', err.message);
    return null;
  }
};

const searchSpotifyPlaylist = async (query) => {
  try {
    const token = await getSpotifyToken();
    const res = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: query, type: 'playlist', limit: 1, market: 'IN' },
      headers: { Authorization: `Bearer ${token}` },
    });
    const playlist = res.data.playlists?.items?.[0];
    if (!playlist) return null;
    return {
      title: playlist.name,
      description: playlist.description,
      imageUrl: playlist.images[0]?.url,
      externalUrl: playlist.external_urls.spotify,
      externalId: playlist.id,
      source: 'spotify',
    };
  } catch (err) {
    logger.warn('Spotify playlist search failed:', err.message);
    return null;
  }
};

// ── TMDB ──────────────────────────────────────────────────────────────────────
const searchMovie = async (query) => {
  try {
    const res = await axios.get(`${process.env.TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query,
        language: 'en-IN',
        region: 'IN',
        include_adult: false,
      },
    });
    const movie = res.data.results?.[0];
    if (!movie) return null;
    return {
      title: movie.title,
      description: movie.overview?.slice(0, 200),
      imageUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      externalId: String(movie.id),
      source: 'tmdb',
      rating: movie.vote_average,
      releaseYear: movie.release_date?.split('-')[0],
    };
  } catch (err) {
    logger.warn('TMDB search failed:', err.message);
    return null;
  }
};

// ── YouTube ───────────────────────────────────────────────────────────────────
const searchYouTube = async (query, type = 'video') => {
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        q: query,
        type,
        part: 'snippet',
        maxResults: 1,
        safeSearch: 'strict',
        relevanceLanguage: 'en',
      },
    });
    const item = res.data.items?.[0];
    if (!item) return null;
    const videoId = item.id.videoId || item.id.playlistId;
    return {
      title: item.snippet.title,
      description: item.snippet.description?.slice(0, 200),
      imageUrl: item.snippet.thumbnails?.medium?.url,
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`,
      externalId: videoId,
      source: 'youtube',
    };
  } catch (err) {
    logger.warn('YouTube search failed:', err.message);
    return null;
  }
};

/**
 * Enrich an AI-generated recommendation with real external data.
 */
const enrichRecommendation = async (rec) => {
  try {
    switch (rec.type) {
      case 'song':
        return { ...rec, ...(await searchSpotifyTrack(rec.searchQuery) || {}) };
      case 'movie':
        return { ...rec, ...(await searchMovie(rec.searchQuery) || {}) };
      case 'podcast':
        return { ...rec, ...(await searchSpotifyPlaylist(`${rec.searchQuery} podcast`) || {}) };
      case 'meditation':
      case 'video':
        return { ...rec, ...(await searchYouTube(`${rec.searchQuery} guided`) || {}) };
      default:
        return rec;
    }
  } catch (err) {
    logger.warn(`Enrichment failed for "${rec.title}":`, err.message);
    return rec;
  }
};

module.exports = { enrichRecommendation, searchSpotifyTrack, searchMovie, searchYouTube };
