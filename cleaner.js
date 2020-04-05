// Deletes files that are not valid for processing using analyzer.js (files that would be skipped in that script)

const { default: SlippiGame } = require('slp-parser-js');
const fs = require('fs');
const config = require('./config.json');

const dataDirectory = config.dataDirectory;

var deleted = 0;
var total = 0;

fs.readdirSync(dataDirectory).forEach((file, index, array) => {

    total++;

    if (file === '.gitkeep') {
        return;
    }

    if (index === 50 || index % 100 === 0 && index > 0) {
        console.log(`${index}/${array.length} files processed (${Math.round(index/array.length*100)}%)`);
    }

    let game = new SlippiGame(dataDirectory + '/' + file);

    let metadata = game.getMetadata();
    let gameStats = game.getStats();
    let lastFrame = game.getLatestFrame();

    // Check for valid game
    if (!gameStats.gameComplete) {
        fs.unlink(dataDirectory + '/' + file);
        deleted++;  // incomplete games
        return;
    }
    if (!lastFrame) {
        fs.unlink(dataDirectory + '/' + file);
        deleted++;
        return;
    }
    if (!lastFrame.players[0] || !lastFrame.players[1]) {
        fs.unlink(dataDirectory + '/' + file);
        deleted++; // player 1 and/or 2 port empty
        return;
    }
    if (lastFrame.players[0].post.stocksRemaining > 0 && lastFrame.players[1].post.stocksRemaining > 0) {
        fs.unlink(dataDirectory + '/' + file);
        deleted++;  // Game ended early (quit out)
        return;
    }
    if (!metadata.players['0'] || !metadata.players['1']) {
        fs.unlink(dataDirectory + '/' + file);
        deleted++;
        return;
    }

});

console.log(`${deleted} of ${total} files deleted (${total-deleted} remain)`);

