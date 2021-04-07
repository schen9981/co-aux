import axios from 'axios';

/**
 *
 * @param {string} accessToken
 * @return {object}
 */
async function getUserInfo(accessToken) {
  const url = 'https://api.spotify.com/v1/me';
  const config = {
    headers: {
      'Authorization': `Bearer ${req.session.tokens.access_token}`,
    },
  };
  const response = await axios.get(url, config);
  return response.data;
}

export default {getUserInfo};
