import axios from 'axios';

const baseURL = 'https://slippistats.online/slippi/'

// Uncomment this URL in development to communicate with the local API.
//const baseURL = 'http://localhost:3000/slippi/'
export default {
  save: (data, onUploadProgress) => {
    return axios({
      method: 'POST',
      url: baseURL + 'save',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      data,
      onUploadProgress: ProgressEvent => onUploadProgress(ProgressEvent)
    });
  },
  getStats: (code, params) => {
    return axios({
      method: 'GET',
      url: baseURL + 'stats/' + code,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      params
    });
  }
}
