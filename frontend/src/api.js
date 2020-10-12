import axios from 'axios';

var baseURL = process.env.VUE_APP_BASE_URL;

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
      url: baseURL + 'stats' + (code ? `/${code}` : ''),
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      params
    });
  },
  checkMaintenance: () => {
    return axios({
      method: 'GET',
      url: baseURL + 'maintenance',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  },
  getTotalGameCount: () => {
    return axios({
      method: 'GET',
      url: baseURL + 'totalGameCount',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
}
