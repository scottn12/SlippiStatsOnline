const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
    win: Number,  // 1 for player 1 win, 2 for player 2 win
    lraStart: Boolean,
    timeout: Boolean,
    stage: Number,
    date: Date,
    numFrames: Number,

    p1Code: String,
    p1Tag: String,
    p1Character: Number,
    p1StocksTaken: Number,
    p1StockDifferential: Number,
    p1TotalDamage: Number,
    p1Apm: Number,
    p1Openings: Number,
    p1NeutralWins: Number,
    p1NeutralLosses: Number,
    p1Conversions: Number,
    p1MissedConversions: Number,
    p1CounterHits: Number,
    p1NegativeCounterHits: Number,
    p1BeneficialTrades: Number,
    p1NegativeTrades: Number,

    p2Code: String,
    p2Tag: String,
    p2Character: Number,
    p2StocksTaken: Number,
    p2StockDifferential: Number,
    p2TotalDamage: Number,
    p2Apm: Number,
    p2Openings: Number,
    p2NeutralWins: Number,
    p2NeutralLosses: Number,
    p2Conversions: Number,
    p2MissedConversions: Number,
    p2CounterHits: Number,
    p2NegativeCounterHits: Number,
    p2BeneficialTrades: Number,
    p2NegativeTrades: Number
});
const GameModel = mongoose.model('Games', GameSchema);

module.exports.models = {
    GameModel
}

module.exports.config = {
    url: 'mongodb://localhost:27017/slippi',
    queries: {

    }
}
