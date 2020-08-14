const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./routes')(db).router;
const fs = require('fs');
const path = require('path');
const logs = require('./config/logger');

const app = express();
const port = 3000;

app.use(cors());
app.use(logs.logger);
app.use('/slippi', routes);
app.use(logs.errorLogger);

var server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});
server.timeout = 1000 * 60 * 30;

// Cleanup tmp directory
fs.readdir('tmp', (err, files) => {
    if (err) console.log('Unable to read directory:', err);

    for (const file of files) {
        fs.unlink(path.join('tmp', file), err => {
            if (err) console.log('Unable to delete file:', err);
        });
    }
});
