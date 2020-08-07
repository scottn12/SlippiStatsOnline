const { default: SlippiGame } = require('@slippi/slippi-js');
const fs = require('fs');
const unzipper = require('unzipper');

const stages = { 2: 'Fountain of Dreams', 3: 'Pokemon Stadium', 8: "Yoshi's Story", 28: 'Dreamland', 31: 'Battlefield', 32: 'Final Destination' };

const parserController = (db) => {

    const parse = async (req, res) => {

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
                        win: undefined,
                        lraStart: false,  // Assumed to be false
                        timeout: false,  // Assumed to be false
                        stage: undefined,
                        date: undefined,
                    
                        p1Code: undefined,
                        p1Tag: undefined,
                        p1Character: undefined,
                        p1StocksTaken: undefined,
                        p1StockDifferential: undefined,
                        p1TotalDamage: undefined,
                        p1Apm: undefined,
                        p1Openings: undefined,
                        p1NeutralWins: undefined,
                        p1NeutralLosses: undefined,
                        p1Conversions: undefined,
                        p1MissedConversions: undefined,
                        p1CounterHits: undefined,
                        p1NegativeCounterHits: undefined,
                        p1BeneficialTrades: undefined,
                        p1NegativeTrades: undefined,
                    
                        p2Code: undefined,
                        p2Tag: undefined,
                        p2Character: undefined,
                        p2StocksTaken: undefined,
                        p2StockDifferential: undefined,
                        p2TotalDamage: undefined,
                        p2Apm: undefined,
                        p2Openings: undefined,
                        p2NeutralWins: undefined,
                        p2NeutralLosses: undefined,
                        p2Conversions: undefined,
                        p2MissedConversions: undefined,
                        p2CounterHits: undefined,
                        p2NegativeCounterHits: undefined,
                        p2BeneficialTrades: undefined,
                        p2NegativeTrades: undefined
                    };

                    // Get Game Data
                    const content = await entry.buffer();
                    let game = new SlippiGame(content);

                    /**
                     * Check for players, determine player index, code, tag, date
                     */
                    let metadata = game.getMetadata();
                    if (!metadata.players['0'].names.code || !metadata.players['1'].names.code) {
                        badFiles.push({ file: entry.path, reason: `Player code missing for one or both players.` });
                        entry.autodrain();
                        return;  // Skip game if desired player not found
                    }

                    gameData.p1Code = metadata.players[0].names.code;
                    gameData.p1Tag = metadata.players[0].names.netplay;
                    gameData.p2Code = metadata.players[1].names.code;
                    gameData.p2Tag = metadata.players[1].names.netplay;

                    gameData.date = metadata.startAt;
                    gameData.numFrames = metadata.lastFrame;


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
                    gameData.p1Character = settings.players[0].characterId;
                    gameData.p2Character = settings.players[1].characterId;

                    /**
                     * Determine winner, if game is too short to include, if it was a LRAStart, timeout, and stock differential
                     */
                    let lastFrame = game.getLatestFrame();
                    let gameEnd = game.getGameEnd();
                    let p1LastFrame = lastFrame.players[0].post;
                    let p2LastFrame = lastFrame.players[1].post;

                    gameData.p1StockDifferential = p1LastFrame.stocksRemaining;
                    gameData.p2StockDifferential = p2LastFrame.stocksRemaining;
                    if (gameEnd.gameEndMethod == 7) { // L+R+A+Start
                        if (metadata.lastFrame / 60 > 30) {  // Checks if game was over 30 seconds long
                            badFiles.push({ file: entry.path, reason: 'Game too short.' });
                            entry.autodrain();
                            return;  // Skip game if too short and L+R+A+Start
                        }
                        else {
                            gameData.lraStart = true;
                            if (gameEnd.lrasInitiatorIndex == 0) {
                                gameData.win = 2;  // Considered a win for player that did not quit out
                            }
                            else {
                                gameData.win = 1;  // Considered a win for player that did not quit out
                            }
                        }
                    }
                    else if (gameEnd.gameEndMethod == 1) {  // Timeout
                        gameData.timeout = true;
                        if (p1LastFrame.stocksRemaining > p2LastFrame.stocksRemaining) {  // Player win if they have more stocks at the end
                            gameData.win = 1;
                        }
                        else if (lastPlayerFrame.stocksRemaining < lastOpponentFrame.stocksRemaining) {  // Opponent win if they have more stocks
                            gameData.win = 2;
                        }
                        else if (lastPlayerFrame.percent > lastOpponentFrame.percent) {  // Same number of stocks
                            gameData.win = 2;  // Win for player with less percent
                        }
                        else {
                            gameData.win = 1;  // Win for player with less percent
                        }
                    }
                    else if (gameEnd.gameEndMethod == 2) {  // Normal game end
                        if (p1LastFrame.stocksRemaining > p2LastFrame.stocksRemaining) {
                            gameData.win = 1;  // Player win if they have more stocks at the end
                        }
                        else {
                            gameData.win = 2;  // Player win if they have more stocks at the end
                        }
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
                    let p1Overall = gameStats.overall[0];
                    gameData.p1StocksTaken = p1Overall.killCount;
                    gameData.p1TotalDamage = p1Overall.totalDamage;
                    gameData.p1Apm = p1Overall.inputsPerMinute.ratio;
                    gameData.p1Openings = p1Overall.openingsPerKill.count;
                    gameData.p1NeutralWins = p1Overall.neutralWinRatio.count;
                    gameData.p1NeutralLosses = p1Overall.neutralWinRatio.total - p1Overall.neutralWinRatio.count;
                    gameData.p1Conversions = p1Overall.successfulConversions.count;
                    gameData.p1MissedConversions = p1Overall.successfulConversions.total - p1Overall.successfulConversions.count;
                    gameData.p1CounterHits = p1Overall.counterHitRatio.count;
                    gameData.p1NegativeCounterHits = p1Overall.counterHitRatio.total - p1Overall.counterHitRatio.count;
                    gameData.p1BeneficialTrades = p1Overall.beneficialTradeRatio.count;
                    gameData.p1NegativeTrades = p1Overall.beneficialTradeRatio.total - p1Overall.beneficialTradeRatio.count;

                    let p2Overall = gameStats.overall[1];
                    gameData.p2StocksTaken = p2Overall.killCount;
                    gameData.p2TotalDamage = p2Overall.totalDamage;
                    gameData.p2Apm = p2Overall.inputsPerMinute.ratio;
                    gameData.p2Openings = p2Overall.openingsPerKill.count;
                    gameData.p2NeutralWins = p2Overall.neutralWinRatio.count;
                    gameData.p2NeutralLosses = p2Overall.neutralWinRatio.total - p2Overall.neutralWinRatio.count;
                    gameData.p2Conversions = p2Overall.successfulConversions.count;
                    gameData.p2MissedConversions = p2Overall.successfulConversions.total - p2Overall.successfulConversions.count;
                    gameData.p2CounterHits = p2Overall.counterHitRatio.count;
                    gameData.p2NegativeCounterHits = p2Overall.counterHitRatio.total - p2Overall.counterHitRatio.count;
                    gameData.p2BeneficialTrades = p2Overall.beneficialTradeRatio.count;
                    gameData.p2NegativeTrades = p2Overall.beneficialTradeRatio.total - p2Overall.beneficialTradeRatio.count;

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