const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'tmp',
    filename: function (req, file, cb) {
        cb(null, + Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage });

const routes = (db) => {

    const parser = require('./controllers/parser-controller')(db);
    router.post('/save', upload.array('file'), parser.parse);

    const reader = require('./controllers/read-controller')(db);
    router.get('/', reader.read);

    return {
        router
    }

}

module.exports = routes;
