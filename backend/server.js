const express = require('express');
const cors = require('cors');
const db = require('./controllers/mongo-controller')();
const routes = require('./routes')(db).router;

const app = express();
const port = 3000;

app.use(cors());
app.use('/slippi', routes);

var server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});
server.timeout = 1000 * 60 * 30;
