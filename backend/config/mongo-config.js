const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    code: String,
    opponentCode: String,
    tag: String,
    opponentTag: String,
    stage: Number,
    character: Number,
    opponentCharacter: Number,
    win: Boolean,
    lraStart: Boolean,
    timeout: Boolean,
    stocksTaken: Number,
    opponentStocksTaken: Number,
    stockDifferential: Number,
    opponentStockDifferential: Number,
    totalDamage: Number,
    opponentTotalDamage: Number,
    apm: Number,
    opponentApm: Number,
    openings: Number,
    opponentOpenings: Number,
    neutralWins: Number,
    neutralLosses: Number,
    opponentNeutralWins: Number,
    opponentNeutralLosses: Number,
    conversions: Number,
    missedConversions: Number,
    opponentConversions: Number,
    opponentMissedConversions: Number,
    counterHits: Number,
    negativeCounterHits: Number,
    opponentCounterHits: Number,
    opponentNegativeCounterHits: Number,
    beneficialTrades: Number,
    negativeTrades: Number,
    opponentBeneficialTrades: Number,
    opponentNegativeTrades: Number
});
const GameModel = mongoose.model('Games', GameSchema );

module.exports.models = {
    GameModel
}

module.exports.config = {
    url: 'mongodb://localhost:27017/slippi',
    queries: {
        
    }
}
