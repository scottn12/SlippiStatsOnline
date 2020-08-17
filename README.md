# Slippi Stats Online

This website is designed to provide a way to analyze a large number of [Slippi Online](https://slippi.gg/) games at once.

In addition to providing a clean interface to view and compare stats, this application can also filter the dataset using parameters such as opponent, characters played, stages played on, and more.

## Development

To run either the frontend or the backend the LTS version of [Node JS](https://nodejs.org/en/) needs to be installed.

### Front End

The front end was developed in Javascript, HTML, and CSS using the Vue.js framework along side the Vuetify component library.
To run locally:

1. If running the backend locally, change the `baseAPI` in `src/api.js` to be `http://localhost:3000`.
This should be the same URL as the backend.
1. `npm install`
1. `npm run serve`

### Back End

The back end was developed in node.js using the Express framework and MongoDB database.
To run locally:

1. [Install MongoDB](https://docs.mongodb.com/manual/installation/) locally.
1. Comment out the lines in `server.js` that start the HTTPS server. Uncomment the lines that start the HTTP server.
1. `npm install`
1. `npm start`

## Deployment

This application is deployed on a VPS (Virtual Private Server) running Ubuntu using NGINX and Apache.