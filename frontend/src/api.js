import axios from 'axios';

export default {
  save: (data, onUploadProgress) => {
    return axios({
      method: 'POST',
      url: 'http://localhost:3000/slippi/save',
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
      url: 'http://localhost:3000/slippi/' + code,
      headers: { 
        'Access-Control-Allow-Origin': '*'
      },
      params
    });
  }
}
