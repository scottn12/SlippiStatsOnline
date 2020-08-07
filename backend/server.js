const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./routes')(db).router;
const winston = require('winston');
const fs = require('fs');
const path = require('path');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

logger.add(new winston.transports.Console({
    format: winston.format.simple(),
}));

const app = express();
const port = 3000;

app.use(cors());
app.use('/slippi', routes);

var server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});
server.timeout = 1000 * 60 * 30;

// Cleanup tmp directory
fs.readdir('tmp', (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(path.join('tmp', file), err => {
            if (err) throw err;
        });
    }
});
