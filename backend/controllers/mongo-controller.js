const logger = require('../config/logger-config').logger;
const mongoose = require('mongoose');
const mongoConfig = require('../config/mongo-config');
const config = mongoConfig.config;
const models = mongoConfig.models;

const mongo = () => {

    mongoose.connect(config.url, { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', logger.error.bind(logger, 'connection error:'));
    db.once('open', () => {
        logger.info('Connected to DB');
    });

    const getGames = async (data) => {
        return await models.GameModel.find(data, (err, result) => {
            if (err) logger.error('Error in getGame:', err);
        }).lean().exec();
    };

    const checkGame = async (data) => {
        return await models.GameModel.find(data, (err, result) => {
            if (err) logger.error('Error in checkGame:', err);
        }).limit(1).count();
    };

    const addGame = (data) => {
        var gameInstance = new models.GameModel(data);
        gameInstance.save(function (err) {
            if (err) return logger.error('Error in addGame:', err);
        });
    };

    const getTotalGameCount = async () => {
        return await models.GameModel.estimatedDocumentCount({}, (err, count) => {
            if (err) logger.error('Error in getGame:', err);
        }).lean().exec();
    };

    return {
        getGames,
        checkGame,
        addGame,
        getTotalGameCount
    }

};

module.exports = mongo;
