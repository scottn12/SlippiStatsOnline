const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./routes')(db).router;
const fs = require('fs');
const path = require('path');
const logs = require('./config/logger');
var https = require('https');

const app = express();
const port = 3000;

app.use(cors());
app.use(logs.logger);
app.use('/slippi', routes);
app.use(logs.errorLogger);

// Cleanup tmp directory
fs.readdir('tmp', (err, files) => {
    if (err) console.log('Unable to read directory:', err);

    for (const file of files) {
        fs.unlink(path.join('tmp', file), err => {
            if (err) console.log('Unable to delete file:', err);
        });
    }
});

// Start HTTPS Server
const privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
const certificate = fs.readFileSync('ssl/server.crt', 'utf8');
const credentials = {
    key: privateKey,
    cert: certificate
};
const server = https.createServer(credentials, app);
server.listen(3000);
server.timeout = 1000 * 60 * 30;