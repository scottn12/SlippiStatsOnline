const readController = (db) => {

    const characters = ['captianfalcon', 'donkeykong', 'fox', 'mrgameandwatch', 'kirby', 'bowser', 'link', 'luigi', 'mario', 'marth', 'mewtwo', 'ness', 'peach', 'pikachu', 'iceclimbers', 'jigglypuff', 'samus', 'yoshi', 'zelda', 'sheik', 'falco', 'younglink', 'drmario', 'roy', 'pichu', 'ganondorf'];
    const stages = { 'fountainofdreams': 2, 'pokemonstadium': 3, "yoshisstory": 8, 'dreamland': 28, 'battlefield': 31, 'finaldestination': 32 };
    const cleanCharacters = ['Captian Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco', 'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']
    const cleanStages = { 2: 'Fountain of Dreams', 3: 'Pokemon Stadium', 8: "Yoshi's Story", 28: 'Dreamland', 31: 'Battlefield', 32: 'Final Destination' };


    const read = async (req, res) => {

        /**
         * Check for valid input and find matching games
         */

        var data = {};

        // Get player codes
        if (req.query.code) {
            var code;
            let codeFirstDigit = req.query.code.indexOf(req.query.code.match(/\d/));
            if (codeFirstDigit == -1) {
                return res.status(400).send({ message: 'Invalid player code provided.' });
            }
            code = req.query.code.substring(0, codeFirstDigit).toLocaleUpperCase() + '#' + req.query.code.substring(codeFirstDigit);
            data.code = code;
        }
        else {
            return res.status(400).send({ message: 'Player code is required.' });
        }

        if (req.query.opponentCode) {
            var opponentCode;
            let opponentCodeFirstDigit = req.query.code.indexOf(req.query.code.match(/\d/));
            if (opponentCodeFirstDigit == -1) {
                return res.status(400).send({ message: 'Invalid opponent player code provided.' });
            }
            opponentCode = req.query.opponentCode.substring(0, opponentCodeFirstDigit).toLocaleUpperCase() + '#' + req.query.opponentCode.substring(opponentCodeFirstDigit);
            data.opponentCode = opponentCode;
        }

        // Get characters
        if (req.query.character) {
            var character;
            character = characters.indexOf(req.query.character.toLocaleLowerCase());
            if (character == -1) {
                return res.status(400).send({ message: 'Invalid character.' });
            }
            data.character = character;
        }

        if (req.query.opponentCharacter) {
            var opponentCharacter;
            opponentCharacter = characters.indexOf(req.query.opponentCharacter.toLocaleLowerCase());
            if (opponentCharacter == -1) {
                return res.status(400).send({ message: 'Invalid opponent character.' });
            }
            data.opponentCharacter = opponentCharacter;
        }

        // Get stage
        if (req.query.stage) {
            if (!(req.query.stage.toLocaleLowerCase() in stages)) {
                return res.status(400).send({ message: 'Invalid stage.' });
            }
            data.stage = stages[req.query.stage.toLocaleLowerCase()];
        }

        // Check if LRAStart should be excluded
        if (req.query.excludeLRAStart) {
            if (req.query.excludeLRAStart == 'true') {
                data.lraStart = false;
            }
        }

        let games = await db.getGame(data);

        /**
         * Collect overall stats
         */

        var stats = {
            numGames: 0,
            timeouts: 0,
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
                    negativeTrades: 0
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
                    negativeTrades: 0
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
                }
            }
        };

        let playerOverall = stats.player.overall;
        let opponentOverall = stats.opponent.overall;
        games.forEach(game => {
            // Skip filtered games
            if (data.opponentCode && data.opponentCode != game.opponentCode) return;
            if (data.character && data.character != game.character) return;
            if (data.opponentCharacter && data.opponentCharacter != game.opponentCharacter) return;
            if (data.stage && data.stage != game.stage) return;

            // Get player data
            if (game.tag && game.tag != '') {
                stats.player.playerData.tag = game.tag;
            }
            if (!(game.opponentCode in stats.opponent.playerData)) {
                stats.opponent.playerData.opponentCode = game.tag;
            }
            else if (game.opponentCode in stats.opponent.playerData && game.tag && game.tag != '') {
                stats.opponent.playerData.opponentCode = game.tag;
            }

            // Accumulate overall stats
            stats.numGames++;
            if (game.timeout) {
                stats.timeouts++;
            }
            if (game.win) {
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

            playerOverall.stocksTaken += game.stocksTaken;
            playerOverall.stockDifferential += game.stockDifferential;
            playerOverall.totalDamage += game.totalDamage;
            playerOverall.apm += game.apm;
            playerOverall.openings += game.openings;
            playerOverall.neutralWins += game.neutralWins;
            playerOverall.neutralLosses += game.neutralLosses;
            playerOverall.conversions += game.conversions;
            playerOverall.missedConversions += game.missedConversions;
            playerOverall.counterHits += game.counterHits;
            playerOverall.negativeCounterHits += game.negativeCounterHits;
            playerOverall.beneficialTrades += game.beneficialTrades;
            playerOverall.negativeTrades += game.negativeTrades;
            
            opponentOverall.stocksTaken += game.opponentStocksTaken;
            opponentOverall.stockDifferential += game.opponentStockDifferential;
            opponentOverall.totalDamage += game.opponentTotalDamage;
            opponentOverall.apm += game.opponentApm;
            opponentOverall.openings += game.opponentOpenings;
            opponentOverall.neutralWins += game.opponentNeutralWins;
            opponentOverall.neutralLosses += game.opponentNeutralLosses;
            opponentOverall.conversions += game.opponentConversions;
            opponentOverall.missedConversions += game.opponentMissedConversions;
            opponentOverall.counterHits += game.opponentCounterHits;
            opponentOverall.negativeCounterHits += game.opponentNegativeCounterHits;
            opponentOverall.beneficialTrades += game.opponentBeneficialTrades;
            opponentOverall.negativeTrades += game.opponentNegativeTrades;

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
        playerAverage.beneficialCounterHitRatio = (playerOverall.beneficialTrades / (playerOverall.beneficialTrades + playerOverall.negativeTrades)).toFixed(2);
        playerAverage.beneficialTradeRatio = (playerOverall.beneficialTrades / (playerOverall.beneficialTrades + playerOverall.negativeTrades)).toFixed(2);

        opponentAverage.stocksTaken = (opponentOverall.stocksTaken / stats.numGames).toFixed(2);
        opponentAverage.stockDifferential = (opponentOverall.stockDifferential / opponentOverall.wins).toFixed(2);
        opponentAverage.totalDamage = (opponentOverall.totalDamage / stats.numGames).toFixed(2);
        opponentAverage.apm = (opponentOverall.apm / stats.numGames).toFixed(2);
        opponentAverage.openingsPerKill = (opponentOverall.openings / opponentOverall.stocksTaken).toFixed(2);
        opponentAverage.neutralWinRatio = (opponentOverall.neutralWins / (opponentOverall.neutralWins + opponentOverall.neutralLosses)).toFixed(2);
        opponentAverage.conversionRatio = (opponentOverall.conversions / (opponentOverall.conversions + opponentOverall.missedConversions)).toFixed(2);
        opponentAverage.beneficialCounterHitRatio = (opponentOverall.beneficialTrades / (opponentOverall.beneficialTrades + opponentOverall.negativeTrades)).toFixed(2);
        opponentAverage.beneficialTradeRatio = (opponentOverall.beneficialTrades / (opponentOverall.beneficialTrades + opponentOverall.negativeTrades)).toFixed(2);

        res.send(stats);

    };

    return {
        read
    }

};

module.exports = readController;