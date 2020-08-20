const logger = require('../config/logger-config').logger;

const maintenanceController = () => {

    const getMaintenance = (req, res) => {
        try {
            // Reload config on each request in case it has changed
            delete require.cache[require.resolve('../config/maintenance-config.js')];
            const config = require('../config/maintenance-config');  
            res.send({ display: config.display, message: config.message });
        }
        catch (e) {
            logger.error('Error getting maintenance config', e);
            res.status(500).send({ message: 'Error getting maintenance config.' });
        }
    };

    return {
        getMaintenance
    }

};

module.exports = maintenanceController;