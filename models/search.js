import axios from 'axios';

/**
 *
 * @param {string} name
 * @param {string} accessToken
 * @return {object}
 */
async function searchTracks(name, accessToken) {
  const url = 'https://api.spotify.com/v1/search';
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    params: {
      'q': name,
      'type': 'track',
    },
  };

  const response = await axios.get(url, config);
  return response.data.tracks.items;
}

export default {searchTracks};
