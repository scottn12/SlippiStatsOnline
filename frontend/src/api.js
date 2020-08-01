import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:3000/slippi',
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
});
