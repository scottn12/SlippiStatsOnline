const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./config/routes')(db).router;
const fs = require('fs');
const path = require('path');
const rimraf = require("rimraf");
const logs = require('./config/logger-config');
const logger = logs.logger;
const https = require('https');
const env = process.env.NODE_ENV || 'develop';


const app = express();
const port = 3000;

app.use(cors());
app.use(logs.requestLogger);
app.use(logs.errorLogger);
app.use('/api', routes);

// Cleanup tmp directory
rimraf('./tmp', () => {
    // Timeout to allow directory to be fully deleted first
    setTimeout(() => {
        fs.mkdir('./tmp', () => {
            fs.writeFile('./tmp/.gitkeep', '', () => { });
        });
    }, 1000);
});

if (env == 'prod') {
    // Start HTTPS Server
    const privateKey = fs.readFileSync('ssl/server.key', 'utf8');
    const certificate = fs.readFileSync('ssl/server.crt', 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate
    };
    const server = https.createServer(credentials, app);
    server.listen(port);
    server.timeout = 1000 * 60 * 30;
    logger.info('HTTPS server started');
}
else if (env == 'develop') {
    // Start HTTP Server
    const server = app.listen(port, () => {
        logger.info(`Server listening at http://localhost:${port}`)
    });
    server.timeout = 1000 * 60 * 30;
}
else {
    logger.error('ENV not set. Failed to start server.');
}