# Scott Stats

This website is designed to provide a way to analyze a large number of [Slippi Online](https://slippi.gg/) games at once.

In addition to providing a clean interface to view and compare stats, this application can also filter the dataset using parameters such as opponent, characters played, stages played on, and more.

## Front End
The front end was developed in Javascript, HTML, and CSS using the Vue.js framework along side the Vuetify component library.
To run locally:
1. `npm install`
2. `npm run serve`

## Back End
The back end was developed in node.js using the Express framework and MongoDB database.
To run locally:
1. Comment out the lines in `server.js` that start the HTTPS server. Uncomment the lines that start the HTTP server.
2. `npm install`
3. `npm start`

## Deployment
This application is deployed on a VPS (Virtual Private Server) running Ubuntu using NGINX and Apache.