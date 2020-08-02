const { default: SlippiGame } = require('@slippi/slippi-js');
const fs = require('fs');
const unzipper = require('unzipper');

const stages = { 2: 'Fountain of Dreams', 3: 'Pokemon Stadium', 8: "Yoshi's Story", 28: 'Dreamland', 31: 'Battlefield', 32: 'Final Destination' };

const parserController = (db) => {

    const parse = async (req, res) => {

        var player = req.headers.player;

        var badFiles = [];
        var success = 0;

        for (const file of req.files) {
            var path = file.path;

            await fs.createReadStream(path)
            .pipe(unzipper.Parse())
            .on('entry', async entry => {

                try {
                    // Initialize Data
                    var gameData = {
                        code: undefined,
                        opponentCode: undefined,
                        tag: undefined,
                        opponentTag: undefined,
                        stage: undefined,
                        character: undefined,
                        opponentCharacter: undefined,
                        win: undefined,
                        lraStart: false,  // Assumed to be false
                        timeout: false,  // Assumed to be false
                        stocksTaken: undefined,
                        opponentStocksTaken: undefined,
                        stockDifferential: undefined,
                        opponentStockDifferential: undefined,
                        totalDamage: undefined,
                        opponentTotalDamage: undefined,
                        apm: undefined,
                        opponentApm: undefined,
                        openings: undefined,
                        opponentOpenings: undefined,
                        neutralWins: undefined,
                        neutralLosses: undefined,
                        opponentNeutralWins: undefined,
                        opponentNeutralLosses: undefined,
                        conversions: undefined,
                        missedConversions: undefined,
                        opponentConversions: undefined,
                        opponentMissedConversions: undefined,
                        counterHits: undefined,
                        negativeCounterHits: undefined,
                        opponentCounterHits: undefined,
                        opponentNegativeCounterHits: undefined,
                        beneficialTrades: undefined,
                        negativeTrades: undefined,
                        opponentBeneficialTrades: undefined,
                        opponentNegativeTrades: undefined
                    };

                    // Get Game Data
                    const content = await entry.buffer();
                    let game = new SlippiGame(content);

                    /**
                     * Check for players, determine player index, code, tag
                     */
                    let metadata = game.getMetadata();
                    let playerIndex = -1;
                    let opponentIndex = -1;
                    if (metadata.players[0].names.code.toLocaleUpperCase() == player.toLocaleUpperCase()) {
                        playerIndex = 0;
                        opponentIndex = 1;
                    }
                    else if (metadata.players[1].names.code.toLocaleUpperCase() == player.toLocaleUpperCase()) {
                        playerIndex = 1;
                        opponentIndex = 0;
                    }
                    if (playerIndex == -1) {
                        badFiles.push({ file: entry.path, reason: `Player code ${player} not found.` });
                        entry.autodrain();
                        return;  // Skip game if desired player not found
                    }
                    gameData.code = metadata.players[playerIndex].names.code;
                    gameData.tag = metadata.players[playerIndex].names.netplay;
                    gameData.opponentCode = metadata.players[opponentIndex].names.code;
                    gameData.opponentTag = metadata.players[opponentIndex].names.netplay;

                    /**
                     * Check for valid game settings, get stage and characters
                     */
                    let settings = game.getSettings();
                    if (!(settings.stageId in stages)) {
                        badFiles.push({ file: entry.path, reason: 'Illegal stage.' });
                        entry.autodrain();
                        return;  // Skip game if non legal stage
                    }
                    gameData.stage = settings.stageId;
                    gameData.character = settings.players[playerIndex].characterId;
                    gameData.opponentCharacter = settings.players[opponentIndex].characterId;

                    /**
                     * Determine winner, if game is too short to include, if it was a LRAStart, timeout, and stock differential
                     */
                    let lastFrame = game.getLatestFrame();
                    let gameEnd = game.getGameEnd();
                    let lastPlayerFrame = lastFrame.players[playerIndex].post;
                    let lastOpponentFrame = lastFrame.players[opponentIndex].post;

                    gameData.stockDifferential = lastPlayerFrame.stocksRemaining;
                    gameData.opponentStockDifferential = lastOpponentFrame.stocksRemaining;
                    if (gameEnd.gameEndMethod == 7) { // L+R+A+Start
                        if (metadata.lastFrame / 60 > 30) {  // Checks if game was over 30 seconds long
                            badFiles.push({ file: entry.path, reason: 'Game too short.' });
                            entry.autodrain();
                            return;  // Skip game if too short and L+R+A+Start
                        }
                        else {
                            gameData.lraStart = true;
                            gameData.win = gameEnd.lrasInitiatorIndex == opponentIndex;  // Considered a win if the opponent started the LRAStart
                        }
                    }
                    else if (gameEnd.gameEndMethod == 1) {  // Timeout
                        gameData.timeout = true;
                        if (lastPlayerFrame.stocksRemaining > lastOpponentFrame.stocksRemaining) {  // Player win if they have more stocks at the end
                            gameData.win = true;
                        }
                        else if (lastPlayerFrame.stocksRemaining < lastOpponentFrame.stocksRemaining) {  // Opponent win if they have more stocks
                            gameData.win = false;
                        }
                        else {  // Same number of stocks
                            gameData.win = lastPlayerFrame.percent < lastOpponentFrame.percent;  // Win if player has less percent at the end, loss otherwise
                        }
                    }
                    else if (gameEnd.gameEndMethod == 2) {  // Normal game end
                        gameData.win = lastPlayerFrame.stocksRemaining > lastOpponentFrame.stocksRemaining;  // Player win if they have more stocks at the end
                    }
                    else {  // Unknown game end type
                        badFiles.push({ file: entry.path, reason: 'Unknown game ending.' });
                        entry.autodrain();
                        return;  // Skip game if unknown game ending
                    }


                    /**
                     * Collect all remaining game stats
                     */

                    let gameStats = game.getStats();
                    let overall = gameStats.overall[playerIndex];
                    gameData.stocksTaken = overall.killCount;
                    gameData.totalDamage = overall.totalDamage;
                    gameData.apm = overall.inputsPerMinute.ratio;
                    gameData.openings = overall.openingsPerKill.count;
                    gameData.neutralWins = overall.neutralWinRatio.count;
                    gameData.neutralLosses = overall.neutralWinRatio.total - overall.neutralWinRatio.count;
                    gameData.conversions = overall.successfulConversions.count;
                    gameData.missedConversions = overall.successfulConversions.total - overall.successfulConversions.count;
                    gameData.counterHits = overall.counterHitRatio.count;
                    gameData.negativeCounterHits = overall.counterHitRatio.total - overall.counterHitRatio.count;
                    gameData.beneficialTrades = overall.beneficialTradeRatio.count;
                    gameData.negativeTrades = overall.beneficialTradeRatio.total - overall.beneficialTradeRatio.count;

                    let opponentOverall = gameStats.overall[opponentIndex];
                    gameData.opponentStocksTaken = opponentOverall.killCount;
                    gameData.opponentTotalDamage = opponentOverall.totalDamage;
                    gameData.opponentApm = opponentOverall.inputsPerMinute.ratio;
                    gameData.opponentOpenings = opponentOverall.openingsPerKill.count;
                    gameData.opponentNeutralWins = opponentOverall.neutralWinRatio.count;
                    gameData.opponentNeutralLosses = opponentOverall.neutralWinRatio.total - opponentOverall.neutralWinRatio.count;
                    gameData.opponentConversions = opponentOverall.successfulConversions.count;
                    gameData.opponentMissedConversions = opponentOverall.successfulConversions.total - opponentOverall.successfulConversions.count;
                    gameData.opponentCounterHits = opponentOverall.counterHitRatio.count;
                    gameData.opponentNegativeCounterHits = opponentOverall.counterHitRatio.total - opponentOverall.counterHitRatio.count;
                    gameData.opponentBeneficialTrades = opponentOverall.beneficialTradeRatio.count;
                    gameData.opponentNegativeTrades = opponentOverall.beneficialTradeRatio.total - opponentOverall.beneficialTradeRatio.count;

                    /**
                     * Register game in DB if not already there
                     */
                    let dbGame = await db.getGame(gameData);
                    if (dbGame && dbGame.length > 0) {
                        badFiles.push({ file: entry.path, reason: 'Game with identical data already registered.' });
                    }
                    else {
                        await db.addGame(gameData);
                        success++;

                    }
                }
                catch (e) {
                    console.log(`Unable to parse ${entry.path}:\n${e}`);
                    badFiles.push({ file: entry.path, reason: 'Error parsing game data.' });
                }

                await entry.autodrain();
            })
            .promise();

            // Delete zip file
            fs.unlink(path, (result, err) => {
                if (err) {
                    console.log(`Error deleting ${file.filename}:\n${err}`);
                }
            });
        };

        // Allow last file to register (meh)
        setTimeout(() => {
            res.send({ success, badFiles });
        }, 1000);

    };

    return {
        parse
    }

}

module.exports = parserController;