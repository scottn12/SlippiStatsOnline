const { default: SlippiGame } = require('slp-parser-js');
const fs = require('fs');
const config = require('./config.json');

const characters = ['Captian Falcon', 'Donkey Kong', 'Fox', 'Mr. Game & Watch', 'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth', 'Mewtwo', 'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco', 'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf']
const stages = {2: 'Fountain of Dreams', 3: 'Pokemon Stadium', 8: "Yoshi's Story", 28: 'Dreamland', 31: 'Battlefield', 32: 'Final Destination'};

// Config
const dataDirectory = config.dataDirectory;
const player1 = config.player1;
const player1Chars = config.player1Characters;
const player2 = config.player2;
const player2Chars = config.player2Characters;

// Stats (Index 0 : Player 1, Index 2 : Player 1)
let stats = {
    numGames : 0,
    wins : [0, 0],
    fodWins : [0, 0],
    bfWins : [0, 0],
    fdWins : [0, 0],
    yoshiWins : [0, 0],
    psWins : [0, 0],
    dlWins : [0, 0],
    totalDamage : [0, 0],
    stockDiff : [0, 0],  // Number off stocks won by
    apm : [0, 0],  // Actions per minute
    openingsPerKill : [0, 0],
    damagePerOpening : [0, 0],
    neutralWins : [0, 0],
    conversionRatio: [0, 0],
    totalKills: [0, 0],
    sd: [0, 0]
}

fs.readdirSync(dataDirectory).forEach((file, index, array) => {
    
    if (file === '.gitkeep') {
        return;
    }

    if (index === 50 || index % 100 === 0 && index > 0) {
        console.log(`${index}/${array.length} files processed (${Math.round(index/array.length*100)}%)`);
    }

    let game = new SlippiGame(dataDirectory + '/' + file);

    let settings = game.getSettings();
    let metadata = game.getMetadata();
    let gameStats = game.getStats();
    let lastFrame = game.getLatestFrame();

    // Check for valid game
    let reverse = false;  // True if players 1 and 2 are swapped in this game (compared to config)
    if (!gameStats.gameComplete) {
        return;  // Skip incomplete games
    }
    if (!lastFrame.players[0] || !lastFrame.players[1]) {
        return; // Player 2 empty TODO
    }
    if (lastFrame.players[0].post.stocksRemaining > 0 && lastFrame.players[1].post.stocksRemaining > 0) {
        return;  // Game ended early (quit out)
    }

    if (!metadata.players['0'] || !metadata.players['1']) {
        return;
    }
    if (player1.includes(metadata.players['0'].names.netplay) && player2.includes(metadata.players['1'].names.netplay)) {
        if (!player1Chars.includes(characters[settings.players[0].characterId]) || !player2Chars.includes(characters[settings.players[1].characterId])) {
            return;  // Invalid characters
        }
    }
    else if (player2.includes(metadata.players['0'].names.netplay) && player1.includes(metadata.players['1'].names.netplay)) {
        reverse = true;
        if (!player1Chars.includes(characters[settings.players[1].characterId]) || !player2Chars.includes(characters[settings.players[0].characterId])) {
            return;  // Invalid characters
        }
    }
    else {
        return;  // Skip this game if invalid players
    }

    // Collect Stats

    stats.numGames++;

    let p1Index = 0;
    let p2Index = 1;
    if (reverse) {
        p1Index = 1;
        p2Index = 0;
    }

    // Winner Data
    let stage = stages[settings.stageId];
    if (lastFrame.players[p1Index].post.stocksRemaining > 0) {
        stats.wins[0]++;
        stats.stockDiff[0] += lastFrame.players[p1Index].post.stocksRemaining;
        if (stage === 'Fountain of Dreams') {
            stats.fodWins[0]++;
        }
        if (stage === 'Pokemon Stadium') {
            stats.psWins[0]++;
        }
        if (stage === "Yoshi's Story") {
            stats.yoshiWins[0]++;
        }
        if (stage ==='Dreamland') {
            stats.dlWins[0]++;
        }
        if (stage === 'Battlefield') {
            stats.bfWins[0]++;
        }
        if (stage === 'Final Destination') {
            stats.fdWins[0]++;
        }
    }
    else {
        stats.wins[1]++;
        stats.stockDiff[1] += lastFrame.players[p2Index].post.stocksRemaining;
        if (stage === 'Fountain of Dreams') {
            stats.fodWins[1]++;
        }
        if (stage === 'Pokemon Stadium') {
            stats.psWins[1]++;
        }
        if (stage === "Yoshi's Story") {
            stats.yoshiWins[1]++;
        }
        if (stage ==='Dreamland') {
            stats.dlWins[1]++;
        }
        if (stage === 'Battlefield') {
            stats.bfWins[1]++;
        }
        if (stage === 'Final Destination') {
            stats.fdWins[1]++;
        }
    }

    // Player 1
    stats.totalDamage[0] += gameStats.overall[p1Index].totalDamage;
    stats.conversionRatio[0] += gameStats.overall[p1Index].successfulConversions.ratio;
    stats.apm[0] += gameStats.overall[p1Index].inputsPerMinute.ratio;
    stats.openingsPerKill[0] += gameStats.overall[p1Index].openingsPerKill.ratio;
    stats.damagePerOpening[0] += gameStats.overall[p1Index].damagePerOpening.ratio;
    stats.neutralWins[0] += gameStats.overall[p1Index].neutralWinRatio.count;
    stats.totalKills[0] += gameStats.overall[p1Index].killCount;

    // Player 2
    stats.totalDamage[1] += gameStats.overall[p2Index].totalDamage;
    stats.conversionRatio[1] += gameStats.overall[p2Index].successfulConversions.ratio;
    stats.apm[1] += gameStats.overall[p2Index].inputsPerMinute.ratio;
    stats.openingsPerKill[1] += gameStats.overall[p2Index].openingsPerKill.ratio;
    stats.damagePerOpening[1] += gameStats.overall[p2Index].damagePerOpening.ratio;
    stats.neutralWins[1] += gameStats.overall[p2Index].neutralWinRatio.count;
    stats.totalKills[1] += gameStats.overall[p2Index].killCount;

});

// console.log('FINAL STATS\n', stats);

// Display
console.log(`Skaht's Stats: (${stats.numGames} total games)`)
console.log(`Players:\t\t${player1} (${player1Chars})\t${player2} (${player2Chars})`);

// Wins
console.log(`Total Wins:\t\t${stats.wins[0]} (${Math.round(stats.wins[0]/stats.numGames*100)}%)\t${stats.wins[1]} (${Math.round(stats.wins[1]/stats.numGames*100)}%)`);
let totalFod = stats.fodWins[0] + stats.fodWins[1];
console.log(`Fountain of Dreams:\t${stats.fodWins[0]} (${Math.round(stats.fodWins[0]/totalFod*100)}%)\t${stats.fodWins[1]} (${Math.round(stats.fodWins[1]/totalFod*100)}%)`);
let totalPS = stats.psWins[0] + stats.psWins[1];
console.log(`Pokemon Stadium:\t${stats.psWins[0]} (${Math.round(stats.psWins[0]/totalPS*100)}%)\t${stats.psWins[1]} (${Math.round(stats.psWins[1]/totalPS*100)}%)`);
let totalYoshi = stats.yoshiWins[0] + stats.yoshiWins[1];
console.log(`Yoshi's Story:\t\t${stats.yoshiWins[0]} (${Math.round(stats.yoshiWins[0]/totalYoshi*100)}%)\t\t${stats.yoshiWins[1]} (${Math.round(stats.yoshiWins[1]/totalYoshi*100)}%)`);
let totalDL = stats.dlWins[0] +stats.dlWins[1];
console.log(`Dreamland:\t\t${stats.dlWins[0]} (${Math.round(stats.dlWins[0]/totalDL*100)}%)\t${stats.dlWins[1]} (${Math.round(stats.dlWins[1]/totalDL*100)}%)`);
let totalBF = stats.bfWins[0] +stats.bfWins[1];
console.log(`Battlefield:\t\t${stats.bfWins[0]} (${Math.round(stats.bfWins[0]/totalBF*100)}%)\t${stats.bfWins[1]} (${Math.round(stats.bfWins[1]/totalBF*100)}%)`);
let totalFD = stats.fdWins[0] +stats.fdWins[1];
console.log(`Final Destination:\t${stats.fdWins[0]} (${Math.round(stats.fdWins[0]/totalFD*100)}%)\t${stats.fdWins[1]} (${Math.round(stats.fdWins[1]/totalFD*100)}%)`);

// Other
console.log(`Damage Dealt:\t\t${(stats.totalDamage[0]/stats.numGames).toFixed(2)}\t\t${(stats.totalDamage[1]/stats.numGames).toFixed(2)}`);
console.log(`Damage per Opening:\t${(stats.damagePerOpening[0]/stats.numGames).toFixed(2)}\t\t${(stats.damagePerOpening[1]/stats.numGames).toFixed(2)}`);
console.log(`Average Kill Percent:\t${Math.round(stats.totalDamage[0]/stats.totalKills[0])}%\t\t${Math.round(stats.totalDamage[1]/stats.totalKills[1])}%`);
console.log(`Conversion Ratio:\t${Math.round(stats.conversionRatio[0]/stats.numGames*100)}%\t\t${Math.round(stats.conversionRatio[1]/stats.numGames*100)}%`);
let totalNeutral = stats.neutralWins[0] + stats.neutralWins[1];
console.log(`Neutral Wins:\t\t${Math.round(stats.neutralWins[0]/totalNeutral*100)}%\t\t${Math.round(stats.neutralWins[1]/totalNeutral*100)}%`);
console.log(`APM:\t\t\t${(stats.apm[0]/stats.numGames).toFixed(2)}\t\t${(stats.apm[1]/stats.numGames).toFixed(2)}`);
console.log(`Margin of Victory:\t${(stats.stockDiff[0]/stats.wins[0]).toFixed(2)}\t\t${(stats.stockDiff[1]/stats.wins[1]).toFixed(2)}`);
