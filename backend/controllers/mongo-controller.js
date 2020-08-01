const mongoose = require('mongoose');
const mongoConfig = require('../config/mongo-config');
const config = mongoConfig.config;
const models = mongoConfig.models

const mongo = () => {

    mongoose.connect(config.url, { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        console.log('Connected to DB');
    });

    const getGame = async (data) => {
        return await models.GameModel.find(data, (err, result) => {
            if (err) console.log(err);
        }).exec();
    }

    const addGame = (data) => {
        var gameInstance = new models.GameModel(data);
        gameInstance.save(function (err) {
            if (err) return handleError(err);
        });
    }

    return {
        getGame,
        addGame
    }

};

module.exports = mongo;
