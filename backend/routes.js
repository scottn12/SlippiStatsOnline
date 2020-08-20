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
    router.post('/save', upload.array('files'), parser.parse);

    const statsController = require('./controllers/stats-controller')(db);
    router.get('/stats/:code', statsController.getStats);
    router.get('/totalGameCount', statsController.getTotalGameCount);

    const maintenanceController = require('./controllers/maintenance-controller')();
    router.get('/maintenance', maintenanceController.getMaintenance)

    return {
        router
    }

}

module.exports = routes;
