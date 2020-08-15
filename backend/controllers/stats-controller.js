const logger = require('../config/logger');

const statsController = (db) => {

    const characterList = ['captainfalcon', 'donkeykong', 'fox', 'mr.game&watch', 'kirby', 'bowser', 'link', 'luigi', 'mario', 'marth', 'mewtwo', 'ness', 'peach', 'pikachu', 'iceclimbers', 'jigglypuff', 'samus', 'yoshi', 'zelda', 'sheik', 'falco', 'younglink', 'dr.mario', 'roy', 'pichu', 'ganondorf'];
    const stageList = { 'fountainofdreams': 2, 'pokemonstadium': 3, "yoshi'sstory": 8, 'dreamland': 28, 'battlefield': 31, 'finaldestination': 32 };
    const cleanCharacters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco', 'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']
    const cleanStages = { 2: 'Fountain of Dreams', 3: 'Pokemon Stadium', 8: "Yoshi's Story", 28: 'Dreamland', 31: 'Battlefield', 32: 'Final Destination' };


    const getStats = async (req, res) => {

        // Setup query object
        var data = {
            $or: []
        };

        /**
         * Check for valid input and find matching games, get player codes
         */
        // Get player codes
        var code;
        if (req.params.code) {
            code = req.params.code.replace('-', '#').toLocaleUpperCase();
            if (!code.match(/^[a-zA-Z\d]{1,6}#\d{1,6}$/)) {
                return res.status(400).send({ message: 'Invalid player code provided.' });
            }
            data.$or.push({ p1Code: code }, { p2Code: code });
        }
        else {
            return res.status(400).send({ message: 'Player code is required.' });
        }

        var opponentCode;
        if (req.query.opponentCode) {
            if (!data.$and) data.$and = [];
            let opponentCode = req.params.code.replace('-', '#').toLocaleUpperCase();
            if (!opponentCode.match(/^[a-zA-Z\d]{1,6}#\d{1,6}$/)) {
                return res.status(400).send({ message: 'Invalid opponent player code provided.' });
            }
            data.$and.push({ $or: [{ p1Code: opponentCode }, { p2Code: opponentCode }] });
        }

        // Get characters
        var characters;
        if (req.query.characters) {
            if (!data.$and) data.$and = [];
            characters = [];
            let err = false
            req.query.characters.forEach((character) => {
                let charIndex = characterList.indexOf(character.toLocaleLowerCase());
                if (charIndex == -1) {
                    err = true;
                }
                characters.push(charIndex);
            });
            if (err) {
                return res.status(400).send({ message: 'Invalid character.' });
            }
            data.$and.push({ $or: [{ p1Character: { $in: characters } }, { p2Character: { $in: characters } }] });
        }

        var opponentCharacters;
        if (req.query.opponentCharacters) {
            if (!data.$and) data.$and = [];
            opponentCharacters = [];
            let err = false
            req.query.opponentCharacters.forEach((character) => {
                let charIndex = characterList.indexOf(character.toLocaleLowerCase());
                if (charIndex == -1) {
                    err = true;
                }
                opponentCharacters.push(charIndex);
            });
            if (err) {
                return res.status(400).send({ message: 'Invalid opponent character.' });
            }
            data.$and.push({ $or: [{ p1Character: { $in: opponentCharacters } }, { p2Character: { $in: opponentCharacters } }] });
        }

        // Get stage
        var stages;
        if (req.query.stages) {
            if (!data.$and) data.$and = [];
            stages = [];
            let err;
            req.query.stages.forEach((stage) => {
                if (!(stage.toLocaleLowerCase() in stageList)) {
                    err = true;
                }
                stages.push(stageList[stage.toLocaleLowerCase()]);
            });
            if (err) {
                return res.status(400).send({ message: 'Invalid stage.' });
            }
            data.$and.push({ stage: { $in: stages } });
        }

        // Check if LRAStart should be excluded
        if (req.query.excludeLRAStart) {
            if (!data.$and) data.$and = [];
            if (req.query.excludeLRAStart == 'true') {
                data.$and.push({ lraStart: false });
            }
        }

        // Get dates
        if (req.query.dates) {
            if (!data.$and) data.$and = [];
            let dates = req.query.dates;
            if (dates.length == 1) {
                dates.push(new Date());
            }
            data.$and.push({ 'date': { '$gte': dates[0], '$lt': dates[1] } });
        }

        let games = await db.getGame(data);

        /**
         * Collect overall stats
         */

        var stats = {
            numGames: 0,
            timeouts: 0,
            totalNumFrames: 0,
            player: {
                playerData: { code: data.code, tag: undefined },
                overall: {
                    wins: 0,
                    lraStarts: 0,
                    stocksTaken: 0,
                    stockDifferential: 0,
                    totalDamage: 0,
                    apm: 0,
                    openings: 0,
                    neutralWins: 0,
                    neutralLosses: 0,
                    conversions: 0,
                    missedConversions: 0,
                    counterHits: 0,
                    negativeCounterHits: 0,
                    beneficialTrades: 0,
                    negativeTrades: 0,
                    fourStocks: 0
                },
                average: {
                    stocksTaken: undefined,
                    stockDifferential: undefined,
                    totalDamage: undefined,
                    apm: undefined,
                    openingsPerKill: undefined,
                    neutralWinRatio: undefined,
                    conversionRatio: undefined,
                    beneficialCounterHitRatio: undefined,
                    beneficialTradeRatio: undefined,
                    killPercent: undefined
                }
            },
            opponent: {
                playerData: {},
                overall: {
                    wins: 0,
                    lraStarts: 0,
                    stocksTaken: 0,
                    stockDifferential: 0,
                    totalDamage: 0,
                    apm: 0,
                    openings: 0,
                    neutralWins: 0,
                    neutralLosses: 0,
                    conversions: 0,
                    missedConversions: 0,
                    counterHits: 0,
                    negativeCounterHits: 0,
                    beneficialTrades: 0,
                    negativeTrades: 0,
                    fourStocks: 0
                },
                average: {
                    stocksTaken: undefined,
                    stockDifferential: undefined,
                    totalDamage: undefined,
                    apm: undefined,
                    openingsPerKill: undefined,
                    neutralWinRatio: undefined,
                    conversionRatio: undefined,
                    beneficialCounterHitRatio: undefined,
                    beneficialTradeRatio: undefined,
                    killPercent: undefined
                }
            }
        };

        let playerOverall = stats.player.overall;
        let opponentOverall = stats.opponent.overall;
        games.forEach(game => {

            // Get player position
            var playerIndex = -1;
            var opponentIndex = -1;

            if (!opponentCode) {
                if (game.p1Code == code) {
                    playerIndex = 0;
                    opponentIndex = 1;
                }
                else if (game.p2Code == code) {
                    playerIndex = 1;
                    opponentIndex = 0;
                }
            }
            else {
                if (game.p1Code == code) playerIndex = 0;
                else if (game.p2Code == code) playerIndex = 1;

                if (game.p1Code == opponentCode) opponentIndex = 0;
                else if (game.p2Code == opponentCode) opponentIndex = 1;
            }

            // Skip games that don't meet character or player criteria
            if (playerIndex == -1 || opponentIndex == -1 || playerIndex == opponentIndex) return;
            if (playerIndex == 0) {
                if (characters && characters.indexOf(game.p1Character) == -1) return;
                if (opponentCharacters && opponentCharacters.indexOf(game.p2Character) == -1) return;
            }
            else {
                if (characters && characters.indexOf(game.p2Character) == -1) return;
                if (opponentCharacters && opponentCharacters.indexOf(game.p1Character) == -1) return;
            }

            /**
             * Get stats from game record
             */

            if (playerIndex == 0) {
                // Get player data
                if (game.p1Tag && game.p1Tag != '') {
                    stats.player.playerData.tag = game.p1Tag;
                }
                if (!(game.p2Tag in stats.opponent.playerData) && game.p2Tag && game.p2Tag != '') {
                    stats.opponent.playerData[game.p2Code] = game.p2Tag;
                }
                else if (game.p2Tag in stats.opponent.playerData && game.p2Tag && game.p2Tag != '') {
                    stats.opponent.playerData[game.p2Code] = game.p2Tag;
                }

                // Accumulate overall stats
                stats.numGames++;
                stats.totalNumFrames += game.numFrames;
                if (game.timeout) {
                    stats.timeouts++;
                }
                if (game.win == 1) {
                    playerOverall.wins++;
                    if (game.lraStart) {
                        opponentOverall.lraStarts++;
                    }
                }
                else {
                    opponentOverall.wins++;
                    if (game.lraStart) {
                        playerOverall.lraStarts++;
                    }
                }

                // Check for 4 stock
                if (game.p1StockDifferential == 4) {
                    playerOverall.fourStocks++;
                }
                else if (game.p2StockDifferential == 4) {
                    opponentOverall.fourStocks++;
                }

                playerOverall.stocksTaken += game.p1StocksTaken;
                playerOverall.stockDifferential += game.p1StockDifferential;
                playerOverall.totalDamage += game.p1TotalDamage;
                playerOverall.apm += game.p1Apm;
                playerOverall.openings += game.p1Openings;
                playerOverall.neutralWins += game.p1NeutralWins;
                playerOverall.neutralLosses += game.p1NeutralLosses;
                playerOverall.conversions += game.p1Conversions;
                playerOverall.missedConversions += game.p1MissedConversions;
                playerOverall.counterHits += game.p1CounterHits;
                playerOverall.negativeCounterHits += game.p1NegativeCounterHits;
                playerOverall.beneficialTrades += game.p1BeneficialTrades;
                playerOverall.negativeTrades += game.p1NegativeTrades;

                opponentOverall.stocksTaken += game.p2StocksTaken;
                opponentOverall.stockDifferential += game.p2StockDifferential;
                opponentOverall.totalDamage += game.p2TotalDamage;
                opponentOverall.apm += game.p2Apm;
                opponentOverall.openings += game.p2Openings;
                opponentOverall.neutralWins += game.p2NeutralWins;
                opponentOverall.neutralLosses += game.p2NeutralLosses;
                opponentOverall.conversions += game.p2Conversions;
                opponentOverall.missedConversions += game.p2MissedConversions;
                opponentOverall.counterHits += game.p2CounterHits;
                opponentOverall.negativeCounterHits += game.p2NegativeCounterHits;
                opponentOverall.beneficialTrades += game.p2BeneficialTrades;
                opponentOverall.negativeTrades += game.p2NegativeTrades;
            }
            else {
                // Get player data
                if (game.p2Tag && game.p2Tag != '') {
                    stats.player.playerData.tag = game.p2Tag;
                }
                if (!(game.p1Tag in stats.opponent.playerData) && game.p1Tag && game.p1Tag != '') {
                    stats.opponent.playerData[game.p1Code] = game.p1Tag;
                }
                else if (game.p1Tag in stats.opponent.playerData && game.p1Tag && game.p1Tag != '') {
                    stats.opponent.playerData[game.p1Code] = game.p1Tag;
                }

                // Accumulate overall stats
                stats.numGames++;
                if (game.timeout) {
                    stats.timeouts++;
                }
                if (game.win == 2) {
                    playerOverall.wins++;
                    if (game.lraStart) {
                        opponentOverall.lraStarts++;
                    }
                }
                else {
                    opponentOverall.wins++;
                    if (game.lraStart) {
                        playerOverall.lraStarts++;
                    }
                }

                // Check for 4 stock
                if (game.p2StockDifferential == 4) {
                    playerOverall.fourStocks++;
                }
                else if (game.p1StockDifferential == 4) {
                    opponentOverall.fourStocks++;
                }

                playerOverall.stocksTaken += game.p2StocksTaken;
                playerOverall.stockDifferential += game.p2StockDifferential;
                playerOverall.totalDamage += game.p2TotalDamage;
                playerOverall.apm += game.p2Apm;
                playerOverall.openings += game.p2Openings;
                playerOverall.neutralWins += game.p2NeutralWins;
                playerOverall.neutralLosses += game.p2NeutralLosses;
                playerOverall.conversions += game.p2Conversions;
                playerOverall.missedConversions += game.p2MissedConversions;
                playerOverall.counterHits += game.p2CounterHits;
                playerOverall.negativeCounterHits += game.p2NegativeCounterHits;
                playerOverall.beneficialTrades += game.p2BeneficialTrades;
                playerOverall.negativeTrades += game.p2NegativeTrades;

                opponentOverall.stocksTaken += game.p1StocksTaken;
                opponentOverall.stockDifferential += game.p1StockDifferential;
                opponentOverall.totalDamage += game.p1TotalDamage;
                opponentOverall.apm += game.p1Apm;
                opponentOverall.openings += game.p1Openings;
                opponentOverall.neutralWins += game.p1NeutralWins;
                opponentOverall.neutralLosses += game.p1NeutralLosses;
                opponentOverall.conversions += game.p1Conversions;
                opponentOverall.missedConversions += game.p1MissedConversions;
                opponentOverall.counterHits += game.p1CounterHits;
                opponentOverall.negativeCounterHits += game.p1NegativeCounterHits;
                opponentOverall.beneficialTrades += game.p1BeneficialTrades;
                opponentOverall.negativeTrades += game.p1NegativeTrades;
            }
        });

        /**
         * Organize per game stats
         */

        let playerAverage = stats.player.average;
        let opponentAverage = stats.opponent.average;

        playerAverage.stocksTaken = (playerOverall.stocksTaken / stats.numGames).toFixed(2);
        playerAverage.stockDifferential = (playerOverall.stockDifferential / playerOverall.wins).toFixed(2);
        playerAverage.totalDamage = (playerOverall.totalDamage / stats.numGames).toFixed(2);
        playerAverage.apm = (playerOverall.apm / stats.numGames).toFixed(2);
        playerAverage.openingsPerKill = (playerOverall.openings / playerOverall.stocksTaken).toFixed(2);
        playerAverage.neutralWinRatio = (playerOverall.neutralWins / (playerOverall.neutralWins + playerOverall.neutralLosses)).toFixed(2);
        playerAverage.conversionRatio = (playerOverall.conversions / (playerOverall.conversions + playerOverall.missedConversions)).toFixed(2);
        playerAverage.beneficialCounterHitRatio = (playerOverall.counterHits / (playerOverall.counterHits + playerOverall.negativeCounterHits)).toFixed(2);
        playerAverage.beneficialTradeRatio = (playerOverall.beneficialTrades / (playerOverall.beneficialTrades + playerOverall.negativeTrades)).toFixed(2);
        playerAverage.killPercent = (playerOverall.totalDamage / playerOverall.stocksTaken).toFixed(2);

        opponentAverage.stocksTaken = (opponentOverall.stocksTaken / stats.numGames).toFixed(2);
        opponentAverage.stockDifferential = (opponentOverall.stockDifferential / opponentOverall.wins).toFixed(2);
        opponentAverage.totalDamage = (opponentOverall.totalDamage / stats.numGames).toFixed(2);
        opponentAverage.apm = (opponentOverall.apm / stats.numGames).toFixed(2);
        opponentAverage.openingsPerKill = (opponentOverall.openings / opponentOverall.stocksTaken).toFixed(2);
        opponentAverage.neutralWinRatio = (opponentOverall.neutralWins / (opponentOverall.neutralWins + opponentOverall.neutralLosses)).toFixed(2);
        opponentAverage.conversionRatio = (opponentOverall.conversions / (opponentOverall.conversions + opponentOverall.missedConversions)).toFixed(2);
        opponentAverage.beneficialCounterHitRatio = (opponentOverall.counterHits / (opponentOverall.counterHits + opponentOverall.negativeCounterHits)).toFixed(2);
        opponentAverage.beneficialTradeRatio = (opponentOverall.beneficialTrades / (opponentOverall.beneficialTrades + opponentOverall.negativeTrades)).toFixed(2);
        opponentAverage.killPercent = (opponentOverall.totalDamage / opponentOverall.stocksTaken).toFixed(2);

        res.send(stats);
    };

    return {
        getStats
    }

};

module.exports = statsController;