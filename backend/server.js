const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./routes')(db).router;
const fs = require('fs');
const path = require('path');
const logs = require('./config/logger-config');
const logger = logs.logger;
var https = require('https');

const app = express();
const port = 3000;

app.use(cors());
app.use(logs.requestLogger);
app.use(logs.errorLogger);
app.use('/slippi', routes);

// Cleanup tmp directory
fs.readdir('tmp', (err, files) => {
    if (err) logger.error('Unable to read directory:', err);

    for (const file of files) {
        if (file != '.gitkeep') {
            fs.unlink(path.join('tmp', file), err => {
                if (err) logger.error('Unable to delete file:', err);
            });
        }
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
server.listen(port);
server.timeout = 1000 * 60 * 30;
logger.info('HTTPS server listening');

// Start HTTP Server
// const server = app.listen(port, () => {
//     logger.info(`Server listening at http://localhost:${port}`)
// });
// server.timeout = 1000 * 60 * 30;